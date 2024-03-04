const express = require('express');
const cors = require('cors'); // 引入cors包
const app = express();

const PORT = 3334;
const OCR_RESULT = `\\begin{tabular}{|c|c|}\n\\hline$x$ & $y$ \\\\\n\\hline 20 & 12.4 \\\\\n30 & 24.8 \\\\\n40 & 49.6 \\\\\n50 & 99.2 \\\\\n60 & 198.4 \\\\\n70 & 396.8 \\\\\n80 & 793.6 \\\\\n\\hline\n\\end{tabular}`;

app.use(cors()); // 在这里使用cors中间件，允许所有跨域请求
app.use(express.json()); // 用于解析JSON格式的请求体

// 提供一个名为 upload_image 的POST接口
app.post('/upload_image', (req, res) => {
    // 这里可以添加逻辑来处理上传的图片，例如保存图片到服务器
    
    // 返回一段JSON数据
    res.json({
        status: 'success',
        message: 'Image uploaded successfully',
        // 这里可以添加更多返回信息，如图片的存储信息等
        text:OCR_RESULT,
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on xxx:${PORT}`);
});
