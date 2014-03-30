function KeyboardInputManager() {
  this.events = {};

  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  var map = {
    38:  0, // Up
    39:  1, // Right
    40:  2, // Down
    37:  3, // Left
    109: 4, // Minus
    107: 5, // Plus
    75:  0, // vim keybindings
    76:  1,
    74:  2,
    72:  3,
    87:  0, // W
    68:  1, // D
    83:  2, // S
    65:  3, // A
    81:  4, // Q
    69:  5, // E
    33:  4, // page up
    34:  5  // page down
  };

  console.log("here");
  var x; //swipe direction
  var s0 = new Date().getTime(); //milliseconds
  var s1 = new Date().getTime();
  var isHorizontal, isVertical;
  var gesture;
  // Setup Leap loop with frame callback function
  Leap.loop({enableGestures: true, frameEventName: "deviceFrame"}, function(frame) {
    if (frame.gestures.length > 0) {
      for (var i = 0; i < frame.gestures.length; i++) {
        gesture = frame.gestures[i];
        if (gesture.type == "swipe") {
            s1 = new Date().getTime();
            //Classify swipe as either horizontal, vertical, lateral
            isHorizontal = (Math.abs(gesture.direction[0]) >= Math.abs(gesture.direction[1])) &&
                                (Math.abs(gesture.direction[0]) >= Math.abs(gesture.direction[2]));
            isVertical   = (Math.abs(gesture.direction[1]) >= Math.abs(gesture.direction[0])) &&
                                (Math.abs(gesture.direction[1]) >= Math.abs(gesture.direction[2]));
            //Classify in + or - direction
            if(isHorizontal) {
                if(gesture.direction[0] > 0)
                    x = "1"; //right
                else
                    x = "3"; //left
            } else if (isVertical) { //vertical
                if(gesture.direction[1] > 0)
                    x = "5"; //up
                else
                    x = "4"; //down
            } else { //lateral
              if(gesture.direction[2] > 0)
                    x = "2"; //backward
                else
                    x = "0"; //forward
            }
         }
      } //end frame gestures for-loop
      if (s1 - s0 > 500) {
          console.log(x); //print
          self.emit("move",x); //make move here
          s0 = s1;
      }
    }
  }) //end Leap.loop callback


  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
    var mapped    = map[event.which];
    if (!modifiers) {
      if (mapped !== undefined) {
        event.preventDefault();
        self.emit("move", mapped);
      }

      // if (event.which === 32) self.restart.bind(self)(event);
    }
  });

  var retry = document.querySelector(".retry-button");
  retry.addEventListener("click", this.restart.bind(this));
  retry.addEventListener("touchend", this.restart.bind(this));

  var keepPlaying = document.querySelector(".keep-playing-button");
  keepPlaying.addEventListener("click", this.keepPlaying.bind(this));
  keepPlaying.addEventListener("touchend", this.keepPlaying.bind(this));
    
  var level1 = document.querySelector(".level1");
  // level1.addEventListener("click", this.moveDown.bind(this));
  level1.addEventListener("touchend", this.moveDown.bind(this));

  var level3 = document.querySelector(".level3");
  // level3.addEventListener("click", this.moveUp.bind(this));
  level3.addEventListener("touchend", this.moveUp.bind(this));

  // Listen to swipe events
  var touchStartClientX, touchStartClientY;
  var gameContainer = document.getElementsByClassName("game-container")[0];

  gameContainer.addEventListener("touchstart", function (event) {
    if (event.touches.length > 1) return;

    touchStartClientX = event.touches[0].clientX;
    touchStartClientY = event.touches[0].clientY;
    event.preventDefault();
  });

  gameContainer.addEventListener("touchmove", function (event) {
    event.preventDefault();
  });

  gameContainer.addEventListener("touchend", function (event) {
    if (event.touches.length > 0) return;

    var dx = event.changedTouches[0].clientX - touchStartClientX;
    var absDx = Math.abs(dx);

    var dy = event.changedTouches[0].clientY - touchStartClientY;
    var absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 10) {
      // (right : left) : (down : up)
      self.emit("move", absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
    }
  });
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
  event.preventDefault();
  this.emit("keepPlaying");
};

KeyboardInputManager.prototype.moveDown = function (event) {
  event.preventDefault();
  this.emit("move", "4");
};

KeyboardInputManager.prototype.moveUp = function (event) {
  event.preventDefault();
  this.emit("move", "5");
};