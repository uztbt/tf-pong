import * as TF from '@tensorflow/tfjs';

/* initial model definition */
const model = TF.sequential();
model.add(TF.layers.dense({units: 256, inputShape: [8]})); //input is a 1x8
model.add(TF.layers.dense({units: 512, inputShape: [256]}));
model.add(TF.layers.dense({units: 256, inputShape: [512]}));
model.add(TF.layers.dense({units: 3, inputShape: [256]})); //returns a 1x3
const learningRate = 0.001;
const optimizer = TF.train.adam(learningRate);
model.compile({loss: 'meanSquaredError', optimizer: optimizer});

//animation of the pong game code
const animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000 / 60)
};

// variables for pong game.
const canvas = document.createElement("canvas");
const width = 400;
const height = 600;
canvas.width = width;
canvas.height = height;
const context = canvas.getContext('2d');
const keysDown: boolean[] = [];

class Game{
    private player: Player;
    private computer: Computer;
    private ball: Ball;
    private ai: AI;
    private ai_plays: boolean;

    constructor(){
        this.player = new Player();
        this.computer = new Computer();
        this.ball = new Ball(200, 300);
        this.ai = new AI();
        this.ai_plays = false;
    }
    //from pong code:
    public render = () => {
        context.fillStyle = "#000000";
        context.fillRect(0, 0, width, height);
        this.player.render();
        this.computer.render();
        this.ball.render();
    };

    //from pong code:
    public update = () => {
        this.player.update();
        if(this.ai_plays){
            const move = this.ai.predict_move();
            this.computer.ai_update(move);
        } else {
            this.computer.update(this.ball);
        }
        if(this.ball.update(this.player.paddle, this.computer.paddle)){
            if(this.ai.new_turn()){
                this.ai_plays=true;
            }
        }
        this.ai.save_data(this.player, this.computer, this.ball)
    };

    //from pong code:
    public step = () => {
        this.update();
        this.render();
        animate(this.step);
    };
}
//from pong code:
class Paddle {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public x_speed: number;
    public y_speed: number;
    
    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.x_speed = 0;
        this.y_speed = 0;
    }

    //from pong code:
    public render = () => {
        context.fillStyle = "#59a6ff";
        context.fillRect(this.x, this.y, this.width, this.height);
    };

    //from pong code:
    public move = (x: number, y: number) => {
        this.x += x;
        this.y += y;
        this.x_speed = x;
        this.y_speed = y;
        if (this.x < 0) {
            this.x = 0;
            this.x_speed = 0;
        } else if (this.x + this.width > 400) {
            this.x = 400 - this.width;
            this.x_speed = 0;
        }
    };
}

//from pong code:
class Computer {
    public paddle: Paddle;

    constructor(){
        this.paddle = new Paddle(175, 10, 50, 10);
    }

    public render = () => {
        this.paddle.render();
    };

    //from pong code:
    public update = (ball: Ball) => {
        const x_pos = ball.x;
        let diff = -((this.paddle.x + (this.paddle.width / 2)) - x_pos);
        if (diff < -4) {
            diff = -5;
        } else if (diff > 4) {
            diff = 5;
        }
        this.paddle.move(diff, 0);
    };

    public ai_update = (move: number = 0) =>
        this.paddle.move(4*move, 0);
    
    get x() {
       return this.paddle.x;
    }
}

//from pong code:
class Player {
    public paddle: Paddle;
    
    constructor(){
        this.paddle = new Paddle(175, 580, 50, 10);
    }

    public render = () => {
        this.paddle.render();
    };

    public update = () => {
        for (var key in keysDown) {
            var value = Number(key);
            if (value === 37) {
                this.paddle.move(-4, 0);
            } else if (value === 39) {
                this.paddle.move(4, 0);
            } else {
                this.paddle.move(0, 0);
            }
        }
    };

    get x(){
        return this.paddle.x;
    }
}

class Ball {
    public x: number;
    public y: number;
    public x_speed: number;
    public y_speed: number;
    
    constructor (x:number, y:number) {
        this.x = x;
        this.y = y;
        this.x_speed = 0;
        this.y_speed = 3;
    }

    public render = () => {
        context.beginPath();
        context.arc(this.x, this.y, 5, 2 * Math.PI, - 2 * Math.PI);
        context.fillStyle = "#ddff59";
        context.fill();
    };

    public update = (paddle1: Paddle, paddle2: Paddle): boolean => {
        this.x += this.x_speed;
        this.y += this.y_speed;
        var top_x = this.x - 5;
        var top_y = this.y - 5;
        var bottom_x = this.x + 5;
        var bottom_y = this.y + 5;

        if (this.x - 5 < 0) {
            this.x = 5;
            this.x_speed = -this.x_speed;
        } else if (this.x + 5 > 400) {
            this.x = 395;
            this.x_speed = -this.x_speed;
        }

        if (this.y < 0 || this.y > 600) {
            this.x_speed = 0;
            this.y_speed = 3;
            this.x = 200;
            this.y = 300;
            //ai.new_turn();
            return true;
        }

        if (top_y > 300) {
            if (top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y && top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x) {
                this.y_speed = -3;
                this.x_speed += (paddle1.x_speed / 2);
                this.y += this.y_speed;
            }
        } else {
            if (top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y && top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x) {
                this.y_speed = 3;
                this.x_speed += (paddle2.x_speed / 2);
                this.y += this.y_speed;
            }
        }
        return false;
    };
}

type SnapShot = [number, number, number, number];
type SnapShots = [number, number, number, number, number, number, number, number];
type Index = 0 | 1 | 2;
type TrainingData = [SnapShots[], SnapShots[], SnapShots[]];
type MoveAsArray = [0, 0, 1] | [0, 1, 0] | [1, 0, 0]

class AI{
    private previous_data: SnapShot;
    private training_data: TrainingData;
    private last_data_object: SnapShots;
    private turn: number;
    private grab_data: boolean;
    private flip_table: boolean;

    constructor(){
        this.previous_data = null;
        this.training_data = [[], [], []];
        this.last_data_object = null;
        this.turn = 0;
        this.grab_data = true;
        this.flip_table = true;
    };

    public save_data = (player: Player, computer: Computer, ball: Ball) => {
        if(!this.grab_data)
            return;
    
        // If this is the very first frame (no prior data):
        if(this.previous_data == null){
            const data: SnapShot = this.flip_table ?
                [width - computer.x, width - player.x, width - ball.x, height - ball.y] :
                [player.x, computer.x, ball.x, ball.y];
            this.previous_data = data;
            return;
        }
    
        // table is rotated to learn from player, but apply to computer position:
        let data_xs: SnapShot, index: Index;
        if(this.flip_table){
            data_xs = [width - computer.x, width - player.x, width - ball.x, height - ball.y];
            index = ((width - player.x) > this.previous_data[1])?0:(((width - player.x) == this.previous_data[1])?1:2);
        }else{
            data_xs = [player.x, computer.x, ball.x, ball.y];
            index = (player.x < this.previous_data[0])?0:((player.x == this.previous_data[0])?1:2);
        }
    
        this.last_data_object = [...this.previous_data, ...data_xs] as SnapShots;
        this.training_data[index].push(this.last_data_object);
        this.previous_data = data_xs;
    }

    public new_turn = (): boolean => {
        this.previous_data = null;
        this.turn++;
        console.log(`new turn: ${this.turn}`);

        if(this.turn > 1){
            this.train();
            //computer.ai_plays = true;
            this.reset();
            return true;
        }
        return false;
    }

    private reset = () => {
        this.training_data = [[], [], []];
        this.turn = 0;
    }

    private train = () => {
        console.log('balancing');
        
        //shuffle attempt
        const len = Math.min(...this.training_data.map(td=>td.length));
        if(!len){
            console.log('Nothing to train');
            return;
        }
        let data_xs: SnapShots[] = [];
        let data_ys: MoveAsArray[] = [];
        for(let i = 0; i < 3; i++){
            data_xs.push(...this.training_data[i].slice(0, len));
            data_ys.push(...Array(len).fill([i===0 ? 1 : 0, i===1? 1 : 0, i===2? 1: 0]));
        }

        console.log('training');
        const xs = TF.tensor(data_xs);
        const ys = TF.tensor(data_ys);

        model.fit(xs, ys).then(console.log);
    }

    public predict_move = (): number =>{
        if(this.last_data_object != null){
            const prediction = model.predict(TF.tensor([this.last_data_object])) as TF.Tensor;
            const move = TF.argMax(prediction, 1).dataSync()[0]-1;
            return move;
        }
    }
}

const game = new Game();
document.body.appendChild(canvas);
animate(game.step);

window.addEventListener('keydown', (event) =>
    keysDown[event.keyCode] = true);

window.addEventListener('keyup', (event) =>
    delete keysDown[event.keyCode]);
