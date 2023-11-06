const express = require("express");
const { Users } = require("../models");
const router = express.Router();
const jwt = require("jsonwebtoken");


router.get("/", (req, res) => {
    res.send("Hi jonghyen");
  });


/**
 * @brief 회원가입 API
 * @request 닉네임, 비밀번호, 비밀번호 확인
 * @note 닉네임은 최소 3자 이상, 알파벳 대소문자(a~z, A~Z), 숫자(0~9)로 구성하기.
 * 비밀번호는 최소 4자 이상이며, 닉네임과 같은 값이 포함된 경우 회원가입에 실패로 만들기.
 * 비밀번호 확인은 비밀번호와 정확하게 일치하기.
 * 데이터베이스에 존재하는 닉네임을 입력한 채 회원가입 버튼을 누른 경우,
 * "중복된 닉네임입니다." 라는 에러메세지를 response에 포함하기
 */



/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: 회원 가입
 *     description: 새로운 사용자를 생성합니다.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nickname
 *               - password
 *               - confirmPassword
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: 유저 고유 닉네임 (3~10자, 알파벳 대소문자와 숫자)
 *               password:
 *                 type: string
 *                 description: 비밀번호 (4~10자)
 *               confirmPassword:
 *                 type: string
 *                 description: 비밀번호 확인
 *     responses:
 *       '201':
 *         description: 회원가입이 완료되었습니다.
 *       '400':
 *         description: "요청의 형식이 잘못되었습니다. (예: 비밀번호나 닉네임 형식 불일치)"
 *       '401':
 *         description: 비밀번호와 비밀번호 확인이 일치하지 않습니다.
 *       '409':
 *         description: 닉네임이 이미 존재하거나 비밀번호가 닉네임을 포함합니다.
 */
router.post("/users", async (req, res) => {
    const { nickname, password, confirmPassword } = req.body;

    try {
        const nicknamePattern = /^[a-zA-Z0-9]{3,}$/;
        const passwordLengthRegex = /^.{4,}$/
        const nicknameRegex = new RegExp(nickname, "i");

        // 닉네임 형식이 비정상적인 경우
        if (!nicknamePattern.test(nickname)) {
            res.status(400).json({
                errorMessage: "닉네임의 형식이 일치하지 않습니다.",
            });
            return;
        }

        // 비밀번호가 일치하지 않는 경우
        if (password !== confirmPassword) {
            res.status(401).json({
                errorMessage: "패스워드가 일치하지 않습니다.",
            });
            return;
        } 

        // 비밀번호 형식이 비정상적인 경우
        if (!passwordLengthRegex.test(password)) {
            res.status(400).json({
                errorMessage: "패스워드 형식이 일치하지 않습니다.",
            });
            return;
        }

        // 비밀번호에 닉네임이 포함되어있는 경우
        if (nicknameRegex.test(password)) {
            res.status(409).json({
                errorMessage: "패스워드에 닉네임이 포함되어 있습니다.",
            });
            return;
        }

        // 닉네임이 중복된 경우
        const isExistUser = await Users.findOne({ where: { nickname } });
        if (isExistUser) {
            return res.status(409).json({ errorMessage: "중복된 닉네임입니다." });
        }

        // Users 테이블에 사용자를 추가합니다.
        const user = await Users.create({ nickname, password });

        return res.status(201).json({ message: "회원가입이 완료되었습니다." });
    } catch (error) {
        // 예외 케이스에서 처리하지 못한 에러
        res.status(400).json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
    }

});



/**
 * @brief 로그인 API
 * @request 닉네임, 비밀번호
 * @note 로그인 버튼을 누른 경우 닉네임과 비밀번호가 데이터베이스에 등록됐는지 확인한 뒤,
 * 하나라도 맞지 않는 정보가 있다면 "닉네임 또는 패스워드를 확인해주세요."라는
 * 에러 메세지를 response에 포함하기.
 * 로그인 성공 시, 로그인에 성공한 유저의 정보를 JWT를 활용하여 클라이언트에게 Cookie로 전달하기
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: 로그인
 *     description: 로그인 API
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nickname
 *               - password
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: 유저 고유 닉네임 (3~10자, 알파벳 대소문자와 숫자)
 *               password:
 *                 type: string
 *                 description: 비밀번호 (4~10자)
 *     responses:
 *       '200':
 *         description: 로그인 성공!
 *       '412':
 *         description: 닉네임 또는 패스워드를 확인해주세요.
 */
router.post("/login", async (req, res) => {
    const { nickname, password } = req.body;
    const user = await Users.findOne({ where: { nickname } });

    try {
        if (!user || user.password !== password) {
            return res.status(412).json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
        } 
        
        // 사용자 정보를 JWT로 생성
        const token = jwt.sign(
            { userId: user.userId },  // 해당 데이터를 payload에 할당
            "customized_secret_key",  // JWT의 비밀키를 customized_secret_key라는 문자열로 할당
            // { expiresIn: "1h" } // JWT의 인증 만료시간을 1시간으로 설정
        );
        
        // token 변수를 authorization 이름을 가진 쿠키에 Bearer 토큰 형식으로 할당
        res.cookie("authorization", `Bearer ${token}`); // JWT를 Cookie로 할당합니다.
        return res.status(200).json({ message: "로그인 성공" });
    } catch (error) {
        // 예외 케이스에서 처리하지 못한 에러
        res.status(400).json({ errorMessage: "로그인에 실패하였습니다." });
    }
});


// // 사용자 조회
// router.get("/users/:userId", async (req, res) => {
//     const { userId } = req.params;

//     const user = await Users.findOne({
//         attributes: ["userId", "email", "createdAt", "updatedAt"],
//         include: [
//             {
//                 model: UserInfos, // 1:1 관계를 맺고있는 UserInfos 테이블을 조회합니다.
//                 attributes: ["nume", "age", "gender", "profileImage"],
//             }
//         ],
//         where: { userId }
//     });

//     return res.status(200).json({ data: user });
// });



module.exports = router;