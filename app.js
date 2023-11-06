const express = require("express");
const cookieParser = require("cookie-parser");
const usersRouter = require("./routes/users.route");
const postsRouter = require("./routes/posts.route");
const commentsRouter = require("./routes/comments.route");

const app = express();
const PORT = 8000;

const cors = require("cors");
let corsOptions = {
    origin: "*", // 출처 허용 옵션
    credential: true, // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
};
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());


// Swagger 연동 코드
const { swaggerUi, specs } = require("./swagger/swagger");

app.use('/api', [usersRouter, postsRouter, commentsRouter]);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => {
    res.send('게시판 첫페이지 - 장종현');
});

app.listen(PORT, () => {
    console.log(PORT, '포트 번호로 서버가 실행되었습니다.');
});