module.exports = {
  lintOnSave: false,

  transpileDependencies: [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        "productName": "Master's Toolbox",
        "win": {
          "target": ["portable"]
        },
        "portable": {
          "artifactName": "master_toolbox.exe"
        },
      }
    },
    moment: {
      locales: ['en']
    }
  }
}
