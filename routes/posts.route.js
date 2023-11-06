const express = require("express");
const { Op } = require("sequelize");
const { Users, Posts } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();


/**
 * @brief 게시글 작성 API
 * @request 제목, 작성내용 입력 (작성자명, 비밀번호 X)
 * @note 토큰을 검사하여, 유효한 토큰일 경우에만 게시글 작성 가능
 */


router.post("/posts", authMiddleware, async (req, res) => {
    const { userId } = res.locals.user;
    const { title, content } = req.body;

    const post = await Posts.create({
        UserId: userId,
        title,
        content,
    });

    return res.status(201).json({ data: post });
});

/**
 * @brief 전체 게시글 목록 조회 API 
 * @response 제목, 작성자명, 작성날짜
 */
router.get("/posts", async (req, res) => {
    const posts = await Posts.findAll({
        attributes: ["postId", "title", "createdAt"],
        include: [
            {
                model: Users,
                attributes: ["nickname"],
            }
        ],
        order: [['createdAt', 'DESC']], // 작성 날짜 기준 내림차순 정렬
    });

    return res.status(200).json({ data: posts });
});



/**
 * @brief 게시글 조회 API
 * @response 제목, 작성자명, 작성날짜, 작성내용
 */
router.get("/posts/:postId", async (req, res) => {
    const { postId } = req.params;
    const post = await Posts.findOne({
        attributes: ["postId", "title", "content", "createdAt", "updatedAt"],
        include: [
            {
                model: Users,
                attributes: ["nickname"]
            }
        ],
        where: { postId }
    });

    return res.status(200).json({ data: post });
});


/**
 * @brief 게시글 수정 API
 * @note 토큰을 검사하여, 해당 사용자가 작성한 게시글만 수정 가능
 */
router.put("/posts/:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    const { title, content } = req.body;

    // 게시글을 조회합니다.
    const post = await Posts.findOne({ where: { postId } });

    if (!post) {
        return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    } else if (post.UserId !== userId) {
        return res.status(401).json({ message: "권한이 없습니다." });
    }

    // 게시글의 권한을 확인하고, 게시글을 수정합니다.
    await Posts.update(
        { title, content }, // title과 content 컬럼을 수정합니다.
        {
            where: {
                [Op.and]: [{ postId }, { UserId: userId }],
            }
        }
    );

    return res.status(200).json({ data: "게시글이 수정되었습니다." });
});


/**
 * @brief 게시글 삭제 API
 * @note 토큰을 검사하여, 해당 사용자가 작성한 게시글만 삭제 가능
 */
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
    const { postId } = req.params;
    const { userId } = res.locals.user;

    // 게시글을 조회합니다.
    const post = await Posts.findOne({ where: { postId } });

    if (!post) {
        return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    } else if (post.UserId !== userId) {
        return res.status(401).json({ message: "권한이 없습니다." });
    }

    // 게시글의 권한을 확인하고, 게시글을 삭제합니다.
    await Posts.destroy({
        where: {
            [Op.and]: [{ postId }, { UserId: userId }],
        }
    });

    return res.status(200).json({ data: "게시글이 삭제되었습니다." });
});


module.exports = router;