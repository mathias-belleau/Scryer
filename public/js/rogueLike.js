let rlike = {}

class RogueLike{
    constructor() {
        this.GameOver = false
        const scale = 1

        this.width = 22*scale
        this.height = 13*scale
        // console.log(tileSet)
        var options = {
            tileColorize:true,
            layout: "tile",
            bg: "transparent",
            tileWidth: 32,
            tileHeight: 32,
            tileSet: tileSet,
            tileMap: tileMap,
            width: this.width,
            height: this.height,
        }

        //make the display panel
        this.display = new ROT.Display(options);
        //scale a little better
        this.display.getContainer().getContext('2d').imageSmoothingEnabled = true; 
        this.display.getContainer().getContext('2d').scale(scale,scale);
        document.body.appendChild(this.display.getContainer());

        //create our list of tiles
        this.mapDataRL = create2DArray(this.height,this.width)
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                let newTile = new TileRL(x,y, "dFloor1")
                this.mapDataRL[x][y] = newTile
            }
        }
        console.log("mapData: ", this.mapDataRL)
        this.DrawMap()
    }

    DrawMap(){
        //iterate over each tile
        for( var y = 0; y < this.height; y++){
            for (var x = 0; x < this.width; x++){
                this.DrawTile(x,y)
            }
        }
    }

    DrawTile(x,y){
        if(this.mapDataRL[x][y] == undefined){
            console.log("x: ", x, " y: ", y)
            return
        }
        //build our array to draw
        let whatToDraw = []
        //push this tiles image
        whatToDraw.push(this.mapDataRL[x][y].tileType)
        var bg = "transparent"
        var fg = "transparent"
        //if this tile has a unit on it, push that too
        if(this.mapDataRL[x][y].unit != undefined){
            // console.log("found unit: ", this.mapData[x][y].unit)
            whatToDraw.push(this.mapDataRL[x][y].unit.tileImg)
            // console.log(whatToDraw)
            fg.push("transparent")
        }

        //actually draw what's on this to map
        this.display.draw(x,y, whatToDraw, fg, bg)

    }

    SetupButtons(){
        const turnButton = document.getElementById("TurnButton")
        turnButton.addEventListener("click", function(e) {
            battleBoard.Turn()
            this.style.display = 'block'; 
            this.style.display = 'none'
        })
    }
}

//actually start the game by making new instance of games
function StartGameRL(){
    rLike = new RogueLike();
    // rLike.SetupButtons()
    
    
}