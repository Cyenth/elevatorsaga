{
    init: function(elevators, floors) {
        var boredElevators = []; // list of elevator indexes
        var pickupQueue = []; // list of floorNums
        
        elevators.forEach(function(e, i, a) {
            var me = e;
            
            var myGoToFloor = function(floorNum) {
                boredElevators = boredElevators.filter(e => e === me.index);
                pickupQueue = pickupQueue.filter(e => e === floorNum);
                me.goToFloor(floorNum);
            };
            
            var wereBored = function(areBored) {
                var alreadyBored = boredElevators.some(e => e === me.index);
                if(typeof(areBored) === 'boolean') {
                    if(!alreadyBored && areBored) {
                        boredElevators.push(me.index);
                    }else if(alreadyBored && !areBored) {
                        boredElevators = boredElevators.filter(e => e !== me.index);
                    }
                }else {
                    return alreadyBored;
                }
            };
            
            e.index = i;
            
            e.on("idle", function() {
                if(me.currentFloor() !== 0) {
                    myGoToFloor(0);
                    return;
                }
                
                wereBored(true);
            });
            
            e.on("floor_button_pressed", function(floorNum) {
               var goingUpGoToFloor = function(floorNum) {
                   if(me.destinationQueue.some(e => e === floorNum))
                       return;
                   
                   var insertIndex = 0;
                   for(var i = 0; i < me.destinationQueue.length; i++) {
                       if(me.destinationQueue[i] < floorNum) {
                           insertIndex++;
                       }else {
                           break;
                       }
                   }
                   
                   me.destinationQueue.splice(insertIndex, 0, floorNum);
                   boredElevators = boredElevators.filter(e => e !== me.index);
                   pickupQueue = pickupQueue.filter(e => !(e.floorNum === floorNum && e.direction === "up"));
                   me.checkDestinationQueue();
               };
                
                var goingDownGoToFloor = function(floorNum) {
                   if(me.destinationQueue.some(e => e === floorNum))
                       return;
                   
                    var insertIndex = 0;
                   
                    for(var i = 0; i < me.destinationQueue.length; i++) {
                        if(me.destinationQueue[i] > floorNum) {
                            insertIndex++;
                        }else {
                            break;
                        }
                    }
                    
                    me.destinationQueue.splice(insertIndex, 0, floorNum);
                    me.checkDestinationQueue();
                    boredElevators = boredElevators.filter(e => e !== me.index);
                    pickupQueue = pickupQueue.filter(e => !(e === floorNum && e.direction === "down"));
               };
               
               if(this.currentFloor() === 0) {
                   this.goingUpIndicator(true);
                   this.goingDownIndicator(false);
                   
                   goingUpGoToFloor(floorNum);
               }else {
                   if(this.goingUpIndicator()) {
                       // We're on our way up from the lobby and someone wants a bigger floor than we're at
                       goingUpGoToFloor(floorNum);
                   }else {
                       // We're on our way down towards the lobby and someone wants a stop along the way
                       goingDownGoToFloor(floorNum);
                   }
               }
            });
            
            e.on("passing_floor", function(floorNum) {
                if(this.goingUpIndicator()) {
                    if(!this.destinationQueue.some(e => e > floorNum)) {
                        this.goingUpIndicator(false);
                        this.goingDownIndicator(true);
                        this.destinationQueue.push(0);
                        this.checkDestinationQueue();
                        boredElevators = boredElevators.filter(e => e !== me.index);
                        pickupQueue = pickupQueue.filter(e => !(e.floorNum === floorNum && e.direction === "down"));
                    }
                }else {
                    
                }
            });
            
            e.on("stopped_at_floor", function(floorNum) {
                 if(floorNum === 0) {
                     this.goingUpIndicator(true);
                 }
            });
        });
        
        floors.forEach(function(e) {
            e.on("up_button_pressed", function() {
                var me = this;
                if(!pickupQueue.some(e => e === me.floorNum() && e.direction === "up")) {
                    pickupQueue.push({floorNum: this.floorNum(), direction: "up"});
                }
                boredElevators.forEach(function(e) { elevators[e].trigger("idle"); });
            });
            
            e.on("down_button_pressed", function() {
                var me = this;
                if(!pickupQueue.some(e => e.floorNum === me.floorNum() && e.direction === "down")) {
                    pickupQueue.push({floorNum: this.floorNum(), direction: "down"});
                }
                boredElevators.forEach(function(e) { elevators[e].trigger("idle"); });
            });
        });
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}