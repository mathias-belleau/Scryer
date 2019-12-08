class Unit {
    constructor(player, unitType) {
        var unitFetched = unitList.get(unitType)
        // console.log("fetched unit: ", unitFetched)

        this.player = player
        //fetch unit type from list
        this.name = unitFetched.name
        this.hp = this.maxHp = unitFetched.maxHP
        this.attacked = false
        this.ranged = unitFetched.ranged == undefined ? false : unitFetched.ranged
        this.leader = false
        this.magic = false
        this.tileImg = unitFetched.tileImg
        this.strength = unitFetched.str
        this.x = undefined
        this.y = undefined

        this.speed = 0
        
        this.attackedUnits = []
    }

    //for ROT scheduler
    getSpeed(){
        return this.speed
    }

    TakeDamage(amount, source){
        this.hp -= amount

        if(this.hp <= 0){
            //trigger death stuff
            this.x = undefined
            this.y = undefined
        }
    }

    Alive(){
        return this.hp > 0
    }

    Attack(target){
        // console.log("attack!")
        // console.log("my coords! x: ", this.x, " y: ", this.y)
        // console.log("target coords! x: ", target.x, " y: ", target.y)

        var dmg = 0
        var dieRolls = []
        for (var i = 0; i < this.strength; i++){
            var value = Math.floor( (Math.random() * 6) + 1)
            value += 0
            value += 0
            if(value >= 6){
                dmg+=1
            }
            dieRolls.push(value)
        }
        //console.log("dmg done: ", dieRolls)
        if(dmg >= 1){
            //hit our enemy 
            var enemyUnit = game.GetTile(target.x, target.y)
            enemyUnit = enemyUnit.unit
            enemyUnit.TakeDamage(dmg)
            console.log(this.name, " dealt ", dmg, " to ", enemyUnit.name , " rolling: ", dieRolls.toString())
        }else{
            //log miss
            // console.log(this.name, " missed, rolling: ", dieRolls.toString())
        }

    }

    TakeTurn(mapData, units){
        if(this.ranged){
            //fire at a random enemy filtering for alive and enemy
            units = units.filter((a) => {return a.player != this.player && a.Alive()})
            if(units.length > 0 ){
                var targetNum = Math.floor(Math.random() * units.length)
                var target = units[targetNum]
                this.Attack(target)
            }
        }else {
            //melee boi
            //get location of all enemies
            //if distance to an enemy is 1? attack it
            //else attempt move towards closest enemy
            //^ if fail attempt move to second closest

            //make new pathfinder for melee
            var xb = this.x
            var yb = this.y
            var passableCallback = function(xb, yb) {
                if(game.mapData[xb] == undefined || game.mapData[xb][yb] == undefined){
                    return 0
                }
                //check if wall
                if(game.mapData[xb][yb].tileType == 'a'){
                    return 0
                }
                //get list of neighbours somehow?
                // [0,1]
                // [0,-1]
                // [1,0]
                // [-1,0]
                var neighs = []
                neighs.push([this._fromX,this._fromY + 1])
                neighs.push([this._fromX,this._fromY - 1])
                neighs.push([this._fromX + 1,this._fromY])
                neighs.push([this._fromX - 1,this._fromY])


                // console.log(this)
                if(!unit.Alive()){
                    return 0
                }
                //if self || or target || empty return true 
                if((this._fromX == xb && this._fromY == yb) || (unit.x == xb && unit.y == yb) || game.mapData[xb][yb].unit == undefined){
                    return 1
                }
                
                //check if has unit existing
                // var thisCoords = [xb,yb]
                // if( (!contains(neighs, thisCoords) && game.mapData[this._fromX][this._fromY].unit.player == game.mapData[xb][yb].unit.player) ){
                //     return 1
                // }
                if(game.mapData[xb][yb].unit.player != game.mapData[this._fromX][this._fromY].unit.player){
                    return 1
                }
                return 0
            }
            
            //store all our paths to all the units
            this.paths = []

        // console.log("this unit is: ", this.tileImg)
            for(var number = 0; number < units.length; number++){
                var path = []
                
                var unit = units[number]
                
                
                var pathCallback = function(x, y) {
                    //// console.log("path: ", x,":",y)
                    path.push([x, y]);
                } 
                // console.log("unit about to path to", unit.tileImg)
                //dont path to ourselves, or a friendly unit
                if(this != unit && this.player != unit.player){
                        var astar = new ROT.Path.AStar(xb, yb, passableCallback, {topology:4});

                        //get the neighbours of this unit for callback
                        //var neighs = astar._getNeighbors(xb, yb)
                        
                        // console.log("need to calc path from:", this.tileImg, " to ", unit.tileImg)
                        var x = unit.x
                        var y = unit.y
                        astar.compute(x, y, pathCallback);

                        // reverse the path as it's stored target -> source
                        path = path.reverse()
                        // console.log(path)
                        // console.log("finished finding path")
                        this.paths.push(path)
                }else{
                    // console.log("don't compute as we match ourselves")
                }
                
            }
            //filter out the dead?
            this.paths = this.paths.filter((a) => a.length > 0)

            //sort paths by distance
            this.paths = this.paths.sort(function(a,b) {return a.length - b.length})
            // console.log("b: ", paths)

            var targetPath = undefined
            //see if i we have a pathable target in our first 3 targets
            if(this.paths.length > 0 && ( game.GetTile(this.paths[0][1][0],this.paths[0][1][1]).unit == undefined || game.GetTile(this.paths[0][1][0],this.paths[0][1][1]).unit.player != this.player)){
                var targetPath = this.paths[0]
            } else if (this.paths.length > 1 && ( game.GetTile(this.paths[1][1][0],this.paths[1][1][1]).unit == undefined || game.GetTile(this.paths[1][1][0],this.paths[1][1][1]).unit.player != this.player)){
                var targetPath = this.paths[1]
            }else if (this.paths.length > 2 && ( game.GetTile(this.paths[2][1][0],this.paths[2][1][1]).unit == undefined ||  game.GetTile(this.paths[2][1][0],this.paths[2][1][1]).unit.player != this.player) ) {
                var targetPath = this.paths[2]
            }else if (this.paths.length > 3 && ( game.GetTile(this.paths[3][1][0],this.paths[3][1][1]).unit == undefined ||  game.GetTile(this.paths[3][1][0],this.paths[3][1][1]).unit.player != this.player) ) {
                var targetPath = this.paths[3]
            }
            if(targetPath != undefined){
                //get first target
                
                var target = {x: targetPath[targetPath.length-1][0], y: targetPath[targetPath.length-1][1]}
                //slice off first and last which is unit and target
                targetPath = targetPath.slice(1,-1)
                //got target
                //sort all enemy paths by distance
                // console.log("got target")

                //pick our target
                //ranged == random
                //melee = closest

                if(targetPath.length > 0){
                    var targetX = targetPath[0][0]
                    var targetY = targetPath[0][1]
                    
                    this.Movement(mapData, { x: targetX, y: targetY })
                }

                //check if attack rangeattack
                //if we are next to something the distance is 0
                //if we we just moved, our path distance is 1 and our current is == to the target
                if(targetPath.length <= 0 || (this.x == targetX && this.y == targetY && targetPath.length == 1)){
                    //TODO: check if this target was already attacked this turn. if yes swing at someone else?
                    this.Attack(target)
                    
                }
        
            }
        }
        //decide what to do
        //if ranged simply fire at a random enemy
        
    }

    Movement(mapData, target){
        // // console.log("moving unit", this)
        //get this units Tile
        var oldTile = mapData[this.x][this.y]
        // console.log(target.x)
        var newTile = game.GetTile(target.x,target.y)
        
       if(newTile == undefined || newTile.unit != undefined){
           return
       }
       
        //assign unit to newTile
        newTile.unit=this
    
        //assign unit to new coords
        this.x = newTile.x
        this.y = newTile.y
    
        //clear old tiles unit
        oldTile.unit = undefined
       
        //draw the tiles again
        game.DrawTile(oldTile.x, oldTile.y)
        game.DrawTile(newTile.x, newTile.y)
    }
}




/* input callback informs about map structure */


let unitList = new Map()

function StartResourceLoading(){
    // console.log("fetching")
    fetch("../json/unitList.json")
    .then(response => response.json())
    .then(json => {
        for(var test in json){
            // console.log( json[test].name)
            unitList.set(json[test].name, json[test])
        }
        // console.log("starting game")
        StartGame()
    });
}



function contains(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i].toString() === obj.toString()) {
            console.log("found neighbours: " + a)
            console.log(obj)
            return true;
        }
    }
    return false;
}

function _getNeighbors(self, cx, cy) {
    var result = 0;

    for (var i = 0; i < self._dirs.length; i++) {
      var dir = self._dirs[i];
      var x = cx + dir[0];
      var y = cy + dir[1];

      if (x < 0 || x >= self._width || y < 0 || y >= self._height) {
        continue;
      }

      //result += self._map[x][y] == 1 ? 1 : 0;
      result+= 1
    }

    return result;
  };