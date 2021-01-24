const router = require('express').Router();
const { findWords } = require('./parser/parser');

router.get('/words', async (req, res) => {
    try {
        const { words } = req.body;
        const result = await findWords(words);

        res.status(200).json({res: result});
    } catch(e) {
        res.status(500).json({message: e.message})
    }
});

module.exports = router;