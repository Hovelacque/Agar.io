const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 400;


const socket = io();
const mouse = {
    x: 0,
    y: 0
};

class Player {
    constructor(id, x, y, size, name, cor = null) {
        this.id = id
        this.x = x;
        this.y = y;
        this.size = size;
        this.name = name;
        this.cor = cor == null ? newColor() : cor;
        this.velocidade = 3;
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.cor
        ctx.fill();

        ctx.fillStyle = 'white'
        ctx.font = '15px Arial';
        let xTexto = ctx.measureText(this.name).width;
        ctx.fillText(this.name, this.x - xTexto / 2, this.y + 3);
    }

    update() {
        this.draw();

        if (mouse.x > 0 && mouse.y > 0) {
            const yDistancia = mouse.y - this.y;
            const xDistancia = mouse.x - this.x;
            const angulo = Math.atan2(yDistancia, xDistancia);
            this.x += Math.cos(angulo) * this.velocidade;
            this.y += Math.sin(angulo) * this.velocidade;
        }


        socket.emit('move', {
            id: socket.id,
            x: this.x,
            y: this.y
        });
    }
}

let voce = null;
const jogadores = [];
// const comidas = [];

function newColor() {
    const r = Math.floor(Math.random() * 255)
    const g = Math.floor(Math.random() * 255)
    const b = Math.floor(Math.random() * 255)
    return `rgba(${r},${g},${b}, 1)`;
}

// function spawnFood(count) {
//     for (let i = 0; i < count; i++) {
//         comidas.push({
//             x: Math.random() * canvas.width,
//             y: Math.random() * canvas.height,
//             cor: newColor()
//         })
//     }
// }

function animate() {
    requestAnimationFrame(animate);

    //fundo
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // //comida
    // comidas.forEach(item => {
    //     ctx.beginPath()
    //     ctx.arc(item.x, item.y, 10, 0, Math.PI * 2);
    //     ctx.fillStyle = item.cor
    //     ctx.fill();
    // })

    //personagem
    voce.update()

    jogadores.forEach(item => {
        item.draw()
    })

    // //verifica se comeu
    // const meuRaio = size / 2;
    // for (let i = comidas.length - 1; i >= 0; i--) {
    //     let comida = comidas[i];

    //     let xDistancia = Math.abs(x - comida.x)
    //     let yDistancia = Math.abs(y - comida.y)
    //     console.log(yDistancia);
    //     console.log(xDistancia);
    //     if (yDistancia <= meuRaio && xDistancia <= meuRaio) { //comeu
    //         size++;
    //         comidas.splice(i, 1)
    //     }
    // }

    // //spanw comidas
    // if (comidas.length <= 25)
    //     spawnFood(25)
}

socket.on('connect', () => {

    console.log('a user connected ==> ' + socket.id);

    socket.on('init', (players) => {
        voce = new Player(
            0,
            canvas.width / 2,
            canvas.height / 2,
            25, 'Você', 'rgba(0,0,255,0.3)'
        )
        players.forEach(player => {
            jogadores.push(new Player(player.id, player.x, player.y, 25, `Jog (${jogadores.length + 1})`))
        });

        animate();
    });
    socket.on('addPlayer', (player) => {
        jogadores.push(new Player(player.id, player.x, player.y, 25, `Jog (${jogadores.length + 1})`))
    });
    socket.on('removePlayer', (id) => {
        const index = jogadores.findIndex(x => x.id == id);
        jogadores.splice(index, 1)
    });
    socket.on('players', (players) => {
        players.forEach(item => {
            const index = jogadores.findIndex(x => x.id == item.id);
            if (index > -1) {
                jogadores[index].x = item.x;
                jogadores[index].y = item.y;
            }
        })
    });
});

window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
})