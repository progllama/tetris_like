window.addEventListener("load", _ => {
    main();
});

const EMPTY = 0;
const FULL = 1;

const X = 0;
const Y = 1;

const FIELD_HEIGHT = 20;
const FIELD_WIDTH = 10;
const Field = new Array(FIELD_WIDTH);

for (let i = 0; i < FIELD_WIDTH; i++)
{
    Field[i] = new Array(FIELD_HEIGHT)
}

Field.forEach(colmun => colmun.fill(EMPTY));

const IBLOCK_SHAPE = [[-1, 0], [0, 0], [1, 0], [2, 0]];
const TBLOCK_SHAPE = [[-1, 0], [0, 0], [1, 0], [0, 1]];
const OBLOCK_SHAPE = [[0, 0], [1, 0], [0, 1], [1, 1]];
const JBLOCK_SHAPE = [[-1, 0], [0, 0], [1, 0], [1, 1]];
const LBLOCK_SHAPE = [[-1, 0], [0, 0], [1, 0], [-1, 1]];
const SBLOCK_SHAPE = [[0, 0], [1, 0], [-1, 1], [0, 1]];
const ZBLOCK_SHAPE = [[-1, 0], [0, 0], [0, 1], [1, 1]];
const BLOCK_SHAPES = [IBLOCK_SHAPE, TBLOCK_SHAPE, OBLOCK_SHAPE, JBLOCK_SHAPE, LBLOCK_SHAPE, SBLOCK_SHAPE, ZBLOCK_SHAPE];

const BLOCK_GENERATE_POSITION = [5, 0];

const MAXIMUM_MOVEDOWN_FAULTS = 2;

let CurrentBlock = undefined;
let MoveDownFaultsCount = 0;

let MoveAmount = [0, 0];
let ShapeNumber = 0;
let RotateCount = 0;
let GameOver = false;

let DeletedLines = 0;

function generateBlock()
{
    const block = [];
    const shape = getNextShape();

    for (const [x, y] of shape)
    {
        block.push([x + BLOCK_GENERATE_POSITION[X], y + BLOCK_GENERATE_POSITION[Y]]);
    }

    MoveAmount = [BLOCK_GENERATE_POSITION[X], BLOCK_GENERATE_POSITION[Y]];
    RotateCount = 0;

    for (const [x, y] of block)
    {
        if (Field[x][y] == FULL)
        {
            GameOver = true;
            return;
        }
    }

    CurrentBlock = block;
}

function getNextShape()
{
    while(true)
    {
        const num = Math.floor(Math.random()*10);
        
        if (num < BLOCK_SHAPES.length)
        {
            ShapeNumber = num;
            return BLOCK_SHAPES[num];
        }
    }
}

function moveLeft()
{
    if (CurrentBlock == undefined) return;


    for (const [x, y] of CurrentBlock)
    {
        if (x - 1 < 0)
        {
            return;
        }

        if (Field[x-1][y] == FULL)
        {
            MoveDownFaultsCount += 1;
            return;
        }

    }

    for (const square of CurrentBlock)
    {
        square[X] -= 1;
    }

    MoveAmount[X] -= 1;
}

function moveRight()
{
    if (CurrentBlock == undefined) return;

    for (const [x, y] of CurrentBlock)
    {
        if (x + 1 >= FIELD_WIDTH)
        {
            return;
        }

        if (Field[x+1][y] == FULL)
        {
            MoveDownFaultsCount += 1;
            return;
        }
    }

    for (const square of CurrentBlock)
    {
        square[X] += 1;
    }

    MoveAmount[X] += 1;
}

function moveDown()
{
    if (CurrentBlock == undefined) return;

    for (const [x, y] of CurrentBlock)
    {
        if (y + 1 >= FIELD_HEIGHT)
        {
            MoveDownFaultsCount += 1;
            return;
        }

        if (Field[x][y+1] == FULL)
        {
            MoveDownFaultsCount += 1;
            return;
        }
    }

    for (const square of CurrentBlock)
    {
        square[Y] += 1;
    }
    MoveDownFaultsCount = 0;

    MoveAmount[Y] += 1;
}

function rotate()
{
    if (CurrentBlock == undefined) return;

    const rotatedBlock = calculateRotation(CurrentBlock);
    
    for (const [x, y] of rotatedBlock)
    {
        if (x < 0 || x >= FIELD_WIDTH)
        {
            return;
        }

        if (y < 0 || y >= FIELD_HEIGHT)
        {
            return;
        }

        if (Field[x][y] == FULL)
        {
            return;
        }
    }

    RotateCount += 1;

    CurrentBlock = rotatedBlock;
}

function calculateRotation()
{
    let block = BLOCK_SHAPES[ShapeNumber].map(square => [square[X], square[Y]]);
    let rotatedBlock = [];

    for (let i = 0; i < RotateCount+1; i++)
    {
        for (const [x, y] of block)
        {
            rotatedBlock.push([
                -y,
                x
            ]);
        }
        block = rotatedBlock;
        rotatedBlock = [];
    }

    for (const square of block)
    {
        square[X] += MoveAmount[X];
        square[Y] += MoveAmount[Y]
    }

    return block;
}

function fixBlock()
{
    for (const [x, y] of CurrentBlock)
    {
        Field[x][y] = FULL;
    }
    CurrentBlock = undefined;
    MoveDownFaultsCount = 0;
}

function deleteLines()
{
    while (true)
    {
        for (let y = FIELD_HEIGHT - 1; y >= 0; y--)
        {
            let isLineFilled = true;
            for (let x = 0; x < FIELD_WIDTH; x++)
            {
                if (Field[x][y] == EMPTY)
                {
                    isLineFilled = false;
                    break;
                }
            }

            if (isLineFilled)
            {
                DeletedLines += 1;
                Field.forEach(colmun => colmun.splice(y, 1));
                Field.forEach(colmun => colmun.unshift(EMPTY));
                break;
            }

            if (y == 0)
            {
                return;
            }
        }
    }
}

function update()
{
    if (GameOver)
    {
        return;
    }

    if (CurrentBlock == undefined)
    {
        generateBlock();
        return;
    }

    if (MoveDownFaultsCount > MAXIMUM_MOVEDOWN_FAULTS)
    {
        fixBlock();
        deleteLines();
    }
    else
    {
        moveDown();
    }
}

function main()
{
    init();
}

function init()
{
    const canvas = document.getElementById("canvas");
    canvas.height = 500;
    canvas.width = 500;
    
    setInterval(() => {
        update();
        render();
    }, 700);

    document.addEventListener("keydown", event => {
        if (event.code == "ArrowRight")
        {
            moveRight();
        }
        else if (event.code == "ArrowLeft")
        {
            moveLeft();
        }
        else if (event.code == "Space")
        {
            rotate();
        }
        else if (event.code == "ArrowDown")
        {
            moveDown();
        }

        render();
    });
}

function render()
{
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw back ground panel
    context.fillStyle = "#112245";
    context.globalAlpha = 0.7;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // display delete line count.
    context.globalAlpha = 0.5;
    context.fillStyle = "black";
    context.fillRect(25, 75, 200, 50);

    context.fillStyle = "snow";
    context.globalAlpha = 1;
    context.font = "48px serif";
    context.fillText(DeletedLines, 30, 120);

    // draw play area
    const blockSize = 20;
    context.clearRect(275, 50, blockSize*10, blockSize*20);
    context.fillStyle = "blue";

    for (let y = 0; y < FIELD_HEIGHT; y++)
    {
        for (let x = 0; x < FIELD_WIDTH; x++)
        {
            if (Field[x][y] == FULL)
            {
                context.fillRect(275+(x*20), 50+(y*20), 20, 20);
            }
        }
    }

    if (CurrentBlock != undefined)
    {
        for (const [x, y] of CurrentBlock)
        {
            context.fillRect(275+(x*20), 50+(y*20), 20, 20);
        }
    }

    if (GameOver)
    {
        context.fillStyle = "red";
        context.globalAlpha = 1;
        context.font = "48px serif";
        context.fillText("  Game", 20, 280);
        context.fillText("     Over", 30, 330);
    }
}