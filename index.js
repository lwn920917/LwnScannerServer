const express = require('express');
const app = express();

const PORT = 3334;

app.use(express.json()); // 用于解析JSON格式的请求体

// 提供一个名为 upload_image 的POST接口
app.post('/upload_image', (req, res) => {
    // 这里可以添加逻辑来处理上传的图片，例如保存图片到服务器
    
    // 返回一段JSON数据
    res.json({
        status: 'success',
        message: 'Image uploaded successfully',
        // 这里可以添加更多返回信息，如图片的存储信息等
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://39.105.195.249:${PORT}`);
});
