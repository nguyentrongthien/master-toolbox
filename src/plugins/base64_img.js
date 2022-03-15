const img = 'data:image/webp;base64,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';

export default img;