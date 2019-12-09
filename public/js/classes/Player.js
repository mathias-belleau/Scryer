
class Player {
    constructor(name, side){
        this.name = name
        this.unitList = []

        //left:0, right: 1
        this.side = side
        this.unitCount = {
            infantry: 0,
            ranged:0,
            leaderMagic:0
        }
    }

    AddUnit(unitName){
        this.unitList.push(unitName)
    }

    SortRankFile(width, height){
        //upon receiving unit decide where to place on map
        // 0 0 0 0 0 0 0 0 0 0 
        // 0 4 9 4 0 0 4 0 0 0
        // 0 2 7 2 0 0 2 0 0 0
        // 0 1 6 1 0 0 1 0 0 0
        // 0 3 8 3 0 0 3 0 0 0
        // 0 5 0 5 0 0 5 0 0 0
        // 0 0 0 0 0 0 0 0 0 0

        this.unitCount.infantry = this.unitList.filter( unit => { return unit.ranged == false && unit.leader == false && unit.magic == false})
        console.log(this.unitList)
        console.log("have ", this.unitCount.infantry.length, " infantry")
        this.unitCount.ranged = this.unitList.filter( unit => unit.ranged == true && unit.leader == false && unit.magic == false)
        console.log("ranged: ", this.unitCount.ranged.length)
        this.unitCount.leader = this.unitList.filter( unit => unit.leader == true || unit.magic == true)

        //game height width hardcoded here. prolly bad
        // how tall our unit lines can be
        var heightCap = height - 4
        

        //how far out we can play units. this is inverse for right side player
        console.log(width)
        var widthCap = (width - 6) / 2
        console.log("widthCap: " , widthCap)
        var maxUnitNum = heightCap * widthCap
        if(this.unitCount.infantry + this.unitCount.ranged + this.unitCount.leaderMagic > maxUnitNum ){
            console.log("BIG OL ERROR TOO MANY UNITS")
            return
        }

        var spawnOrderInf = GenerateSpawnOrder(this.side, heightCap, widthCap, this.unitCount.infantry.length)
        console.log(spawnOrderInf)
        if(spawnOrderInf.length > 0){
            for(var x = 0; x < this.unitCount.infantry.length; x++){
                //for each unit in infantry get it's position it should be at 
                this.unitCount.infantry[x].x = spawnOrderInf[x].x
                this.unitCount.infantry[x].y = spawnOrderInf[x].y
            }
        }

        var spawnOrderRan = GenerateSpawnOrder(this.side, heightCap, widthCap, this.unitCount.ranged.length, Math.floor(this.unitCount.infantry.length / heightCap) + 1)
        console.log("spawn ranged:", spawnOrderRan)
        console.log("spawn ranged:", this.unitCount.ranged)
        if(spawnOrderRan.length > 0){
            for(var x = 0; x < this.unitCount.ranged.length; x++){
                //for each unit in infantry get it's position it should be at 
                this.unitCount.ranged[x].x = spawnOrderRan[x].x
                this.unitCount.ranged[x].y = spawnOrderRan[x].y
            }
        }
       

        
       
    }
}

function GenerateSpawnOrder(side, heightCap, widthCap, count, mod = 0){
    var heightMod = [0, 1, -1, 2, -2, 3, -3, 4, -4]
    
    for(var x = 0; x < count / heightCap; x++){
        heightMod.push(0)
        for(var y = 1; y < heightCap / 2 ; y++){
            heightMod.push(y)
            heightMod.push(y*-1)
        }
        
    }
    
    console.log("height: ", heightMod)
    //for side 0 start at max width and go down
    //for side 1 start at minimum width position and go up
    var placementList = []
    
    var startX = 0
    var startY = 0
    //where to start spawning the first unit
    if(side == 0){
        startX = widthCap
    }else {
        startX = (widthCap*2 + 6) - widthCap
    }
    startY = (heightCap / 2) + 1.5
    console.log("count: ", count)
    if(side == 0){
        for(var x = 0; x < count; x++){
            placementList.push( {x:startX - (Math.floor(x / heightCap) + mod ), y: startY + heightMod[x]} )
        }
    } else {
        for(var x = 0; x < count; x++){
            console.log("startX: ", startX)
            placementList.push( {x:startX + (Math.floor(x / heightCap) + mod ), y: startY + heightMod[x]} )
        }
    }
    return placementList
}