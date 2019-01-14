// José Bezerra 14/01/2019
// jbmn2@cin.ufpe.br

var nn; // Neural Net Variable

var mnist; // MNIST Dataset Object

var train_output = []; // Train Label Array
var train_input = []; // Train Image Array

let trainIndex = testIndex = 0;

var ready = test = false; // Deal with training and testing in draw() loop

var pg; // Another Canvas Variable

var guess = ""; // The prediction

var trainImg;

var trained_model; // Variable to load trained model

// Button Variables
var train_new, load_model, predict_btn, stop_training, continue_traning;

function preload() {

    trained_model = loadJSON("model.json");

    loadMNIST(function (data) {
        console.log("Dataset Loaded");
        mnist = data;

        // Load Buttons

        stop_training = createButton('Stop Training');
        stop_training.class('btn')
        stop_training.position(width + 20, 10)
        stop_training.mousePressed(stopTraining);
        // Stop Training Btn Disabled
        stop_training.attribute('disabled', 'true');

        continue_traning = createButton('Continue Training');
        continue_traning.class('btn')
        continue_traning.position(width + 20, 80)
        continue_traning.mousePressed(continueTraining);
        // Stop Training Btn Disabled
        continue_traning.attribute('disabled', 'true');

        train_new = createButton('Train New Model');
        train_new.class('btn')
        train_new.position(10, height + 30)
        train_new.mousePressed(trainModel);

        load_model = createButton('Load Trained Model');
        load_model.class('btn')
        load_model.position(150, height + 30)
        load_model.mousePressed(loadTrained);

        load_model.attribute('disabled', 'true');

        predict_btn = createButton('Predict Number');
        predict_btn.class('btn')
        predict_btn.position(300, height + 30)
        predict_btn.mousePressed(predict_func);

        // One hot enconding label
        for (let i = 0; i < data.train_label.length; i++) {
            let arr = new Array(10).fill(0);
            let digit = data.train_label[i];
            arr[digit] = 1;
            train_output.push(arr);
        }
    });
}

function setup() {
    createCanvas(1200, 600).parent('container');
    background(0)

    trainImg = createImage(28, 28);
    pg = createGraphics(width / 2, height);
    pg.background(0);

    // Initialize the Neural Net with a node for each pixel in the image (28x28)
    nn = new NeuralNetwork(784, 16, 10);

    // Load the already trained model
    nn.loadModel(trained_model);

    // Wait for the test data
    test = true;

}

// Buttons functions
function trainModel() {
    load_model.removeAttribute('disabled');
    stop_training.removeAttribute('disabled');
    continue_traning.removeAttribute('disabled');

    pg.background(0);
    ready = true;
    test = false;
    trainIndex = 0;

    // Reset the neural net
    nn = new NeuralNetwork(784, 16, 10);
}

function stopTraining() {
    ready = !ready;
    stop_training.attribute('disabled', 'true');
    continue_traning.removeAttribute('disabled');
}

function continueTraining() {
    ready = !ready;
    continue_traning.attribute('disabled', 'true');
    stop_training.removeAttribute('disabled');
}

function loadTrained() {
    train_new.removeAttribute('disabled');
    load_model.attribute('disabled', 'true');
    stop_training.attribute('disabled', 'true');
    continue_traning.attribute('disabled', 'true');

    pg.background(0);
    ready = false;
    test = true;

    // Load the trained model
    nn.loadModel(trained_model);
}

function predict_func() {
    pg.background(0);
    predictDigit();
}
//


function train(show) {
    // Show image in the screen
    trainImg.loadPixels();
    for (let i = 0; i < 784; i++) {
        let brigth = mnist.train_data[i + trainIndex * 784];

        // Feed and normalize the pixel data
        train_input[i] = brigth / 255;

        let index = i * 4;
        trainImg.pixels[index + 0] = brigth;
        trainImg.pixels[index + 1] = brigth;
        trainImg.pixels[index + 2] = brigth;
        trainImg.pixels[index + 3] = brigth;
    }
    trainImg.updatePixels();

    if (show) {
        image(trainImg, width / 2, 0, width / 2, height);
    }

    // Train with the data
    nn.train(train_input, train_output[trainIndex]);

    trainIndex++;
}

function predictDigit() {
    // Initialize the array with the test data
    let test_input = [];
    
    // Show de Image
    let img = createImage(28, 28);
    img.loadPixels();
    for (let i = 0; i < 784; i++) {
        let brigth = mnist.test_data[i + testIndex];

        test_input[i] = brigth / 255;

        let index = i * 4;
        img.pixels[index + 0] = brigth;
        img.pixels[index + 1] = brigth;
        img.pixels[index + 2] = brigth;
        img.pixels[index + 3] = brigth;
    }

    img.updatePixels();
    pg.image(img, 0, 0, width / 2, height);

    // Make the test data a bit more random
    let val = floor(random(1, 10));
    testIndex += 784 * val;

    // Predict based in the pixels values
    let output = nn.predict(test_input);

    // Get the index the one-hot enconding array
    let maxIndex = 0;
    let max = 0;
    for (let i = 0; i < output.length; i++) {
        let value = output[i];
        if (value > max) {
            max = value;
            maxIndex = i;
        }
    }

    guess = maxIndex;
}

function keyPressed() {
    if (key == ' ') {
        pg.background(0);
        predictDigit();
    }
}

function draw() {
    // Draw Line that divide screens
    pg.rect(590, -5, 10, height + 5)

    if (test) {
        ready = false;
    }

    pg.textSize(32);
    pg.fill(255);
    pg.text('Guess: ' + guess, 6, 32);

    if (ready) {

        // train x10 faster
        for (let a = 0; a < 10; a++) {
            background(0)
            if (a == 9) {
                train(true);
            }
            else {
                train(false);
            }
        }

        // Show which image its been trained
        textSize(32);
        fill(255);
        text('Image: ' + trainIndex + "/60.000", 606, 32);

        if (trainIndex == 59000) {
            // saveJSON(nn.serialize(), "model.json"); // Save model in JSON
            test = true;
            console.log("traning complete");
        }
    }

    image(pg, 0, 0);
}