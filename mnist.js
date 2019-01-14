// José Bezerra 14/01/2019
// jbmn2@cin.ufpe.br

var mnist;

let files = {
    trainingImages: 'dataset/train-images-idx3-ubyte',
    trainingLabels: 'dataset/train-labels-idx1-ubyte',
    t10kImages: 'dataset/t10k-images-idx3-ubyte',
    t10kLabels: 'dataset/t10k-labels-idx1-ubyte',
}

async function loadFile(filename, offset){
    let r = await fetch(filename);
    let data = await r.arrayBuffer();
    return await new Uint8Array(data).slice(offset);
}

function loadMNIST(callback){
    loadFile(files.trainingLabels, 8).then(data => {
            mnist = {};
            mnist.train_label = data; 
            return loadFile(files.trainingImages, 16).then(data => {
                mnist.train_data = data;
                return loadFile(files.t10kLabels, 8).then(data => {
                    mnist.test_label = data;
                    return loadFile(files.t10kImages, 16).then(data => {
                        mnist.test_data = data;
                        callback(mnist);
                    });
                });
            });
        });
}