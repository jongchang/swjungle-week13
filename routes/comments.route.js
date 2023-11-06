const express = require("express");
const { Op } = require("sequelize");
const { Users, Comments } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();

/**
 * @brief 댓글 목록 조회 API
 * @note 조회하는 게시글에 작성된 모든 댓글을 목록 형식으로 볼 수 있도록 하기
 * 작성 날짜 기준으로 내림차순 정렬하기
 */
router.get("/posts/:postId/comments", async (req, res) => {
    const { postId } = req.params;
    const comments = await Comments.findAll({
        attributes: ["commentId", "UserId", "comment", "createdAt"],
        include: [
            {
                model: Users,
                attributes: ["nickname"]
            }
        ],
        order: [['createdAt', 'DESC']],
        where: { PostId: postId }
    });

    return res.status(200).json({ data: comments });
});


/**
 * @brief 댓글 작성 API
 * @note 로그인 토큰을 검사하여, 유효한 토큰일 경우에만 댓글 작성 가능
 * 댓글 내용을 비워둔 채 댓글 작성 API를 호출하면 "댓글 내용을 입력해주세요" 라는 메세지를 return하기
 * 댓글 내용을 입력하고 댓글 작성 API를 호출한 경우 작성한 댓글을 추가하기
 */
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    const { comment } = req.body;
    
    if (!comment.length) {
        return res.status(400).json({ message: "댓글 내용을 입력해주세요." })
    }

    const note = await Comments.create({
        UserId: userId,
        PostId: postId,
        comment,
    });

    return res.status(201).json({ data: note });
});


/**
 * @brief 댓글 수정 API
 * @note 로그인 토큰을 검사하여, 해당 사용자가 작성한 댓글만 수정 가능
 * 댓글 내용을 비워둔 채 댓글 수정 API를 호출하면 "댓글 내용을 입력해주세요" 라는 메세지를 return하기
 * 댓글 내용을 입력하고 댓글 수정 API를 호출한 경우 작성한 댓글을 수정하기
 */
router.put("/posts/:postId/comments/:commentId", authMiddleware, async (req, res) => {
    const { postId, commentId } = req.params;
    const { userId } = res.locals.user;
    const { comment } = req.body;

    // 댓글을 조회합니다.
    const note = await Comments.findOne({ where: { commentId } });
    
    if (!note) {
        return res.status(404).json({ message: "댓글이 존재하지 않습니다." });
    } else if (note.UserId !== userId) {
        return res.status(401).json({ message: "권한이 없습니다." });
    } else if (!comment.length) {
        return res.status(400).json({ message: "댓글 내용을 입력해주세요." });
    }

    // 댓글의 권한을 확인하고, 댓글을 수정합니다.
    await Comments.update(
        { comment },
        {
            where: {
                [Op.and]: [{ commentId }, { PostId: postId }, { UserId: userId }],
            }
        }
    );

    return res.status(200).json({ data: "댓글이 수정되었습니다." });
});


/**
 * @brief 댓글 삭제 API
 * @note 로그인 토큰을 검사하여, 해당 사용자가 작성한 댓글만 삭제 가능
 * 원하는 댓글을 삭제하기
 */
router.delete("/posts/:postId/comments/:commentId", authMiddleware, async (req, res) => {
    const { postId, commentId } = req.params;
    const { userId } = res.locals.user;

    // 댓글을 조회합니다.
    const note = await Comments.findOne({ where: { commentId } });

    if (!note) {
        return res.status(404).json({ message: "댓글이 존재하지 않습니다." });
    } else if (note.UserId !== userId) {
        return res.status(401).json({ message: "권한이 없습니다." });
    }

    // 댓글의 권한을 확인하고, 댓글을 삭제합니다.
    await Comments.destroy({
        where: {
            [Op.and]: [{ commentId }, { PostId: postId }, { UserId: userId }],
        }
    });
    
    return res.status(200).json({ data: "댓글이 삭제되었습니다." });
});

module.exports = router;

