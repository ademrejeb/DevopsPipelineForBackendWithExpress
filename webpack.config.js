const path =require ('path');


module.exports={

    entry: {
        main:'./app.js'
    },

    output:{
        path : path.join(__dirname,'dist'),
        publicPath:'/',
        filename: 'main.js',
        clean:true
    },

    mode:'development',
    target:'node',

    module: {
        rules: [
            {
                test:/\.js$/,
                exclude:/node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    },
                }
            }
        ]
    },
    externals: {
        '@mapbox/node-pre-gyp': 'commonjs @mapbox/node-pre-gyp',
        'bcrypt': 'commonjs bcrypt',
        'express': 'commonjs express',
        'mongoose': 'commonjs mongoose',
        'ws': 'commonjs ws',
        'mock-aws-s3': 'commonjs mock-aws-s3',
        'aws-sdk': 'commonjs aws-sdk',
        'nock': 'commonjs nock'
    }

}