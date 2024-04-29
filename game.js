class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    init() {
        this.sys.game.global = { 
            puzzle1Completed: false, 
            puzzle2completed: false, 
            puzzle3completed: false, 
            puzzle4completed: false
        };

        this.registry.set('puzzle1Completed', false);
        this.registry.set('puzzle2Completed', false);
        this.registry.set('puzzle3Completed', false);
        this.registry.set('puzzle4Completed', false);
    }

    create() {
        // You can load any assets you want to load before the game starts here
        // When done, start the MainScene
        this.scene.start('MainScene');
    }
}

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        this.load.image('car', 'miata.png');
        this.load.image('folder', 'folder.png');
        this.load.image('p', 'p-paper.png');
        this.load.image('r', 'r-paper.png');
        this.load.image('o', 'o-paper.png');
        this.load.image('m', 'm-paper.png');
        this.load.image('folderLocked', 'lock.png');
        this.load.image('carShadow', 'miataShadow.png');
        this.load.image('background', 'background.png');
    }

    create() {

                
        this.bg = this.physics.add.staticGroup();
        let background = this.bg.create(300, 200, 'background').setScale(1.1).setDepth(-2);

        this.cameras.main.setBackgroundColor('#88fdb1');
        this.car = this.physics.add.sprite(0, 0, 'car').setScale(0.3).setDepth(2);
        this.carShadow = this.physics.add.sprite(-5, -5, 'carShadow').setScale(0.3).setDepth(1).setAlpha(0.5);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        
        // Folders setup
        this.folders = this.physics.add.staticGroup();
        let folder1 = this.folders.create(300, 500, 'folder').setScale(0.2);
        folder1.sceneKey = 'Inter1';
        let folder2 = this.folders.create(300, -120, 'folderLocked').setScale(0.2);
        folder2.sceneKey = 'Inter2';
        let folder3 = this.folders.create(-60, 200, 'folderLocked').setScale(0.2);
        folder3.sceneKey = 'Inter3';
        let folder4 = this.folders.create(660, 200, 'folderLocked').setScale(0.2);
        folder4.sceneKey = 'Inter4';

        // Overlap events
        this.physics.add.overlap(this.car, this.folders, this.onReachFolder, null, this);
    
        // To handle text removal when moving away
        this.currentFolder = null;  // Track the current folder

        this.cameras.main.startFollow(this.car, true, 0.05, 0.05);
        this.cameras.main.setZoom(1);
        
        // Check puzzle completion status
        if (this.registry.get('puzzle4Completed')) {
            folder4.setTexture('r');
            folder3.setTexture('folder');
        } else if (this.registry.get('puzzle3Completed')) {
            folder3.setTexture('o');
            folder2.setTexture('folder');
        } else if (this.registry.get('puzzle2Completed')) {
            folder1.setTexture('m');
            folder2.setTexture('p');
            folder3.setTexture('folder');
        } else if (this.registry.get('puzzle1Completed')) {
            folder1.setTexture('m');
            folder2.setTexture('folder');
        }
    
    }

    update() {
        // Handle car movement and background scrolling
        if (this.cursors.left.isDown) {
            this.car.setAngle(180).setVelocityX(-360);
            this.carShadow.setAngle(180);
        } else if (this.cursors.right.isDown) {
            this.car.setAngle(0).setVelocityX(360);
            this.carShadow.setAngle(0);
        } else {
            this.car.setVelocityX(0);
        }
        
        if (this.cursors.up.isDown) {
            this.car.setAngle(-90).setVelocityY(-360);
            this.carShadow.setAngle(-90);
            if (this.cursors.right.isDown && this.cursors.up.isDown) {
                this.car.setAngle(-45);
                this.carShadow.setAngle(-45);
            }
            if (this.cursors.left.isDown && this.cursors.up.isDown) {
                this.car.setAngle(-135);
                this.carShadow.setAngle(-135);
            }
        } else if (this.cursors.down.isDown) {
            this.car.setAngle(90).setVelocityY(360);
            this.carShadow.setAngle(90);
            if (this.cursors.down.isDown && this.cursors.left.isDown) {
                this.car.setAngle(135);
                this.carShadow.setAngle(135);
            }
            if (this.cursors.down.isDown && this.cursors.right.isDown) {
                this.car.setAngle(45);
                this.carShadow.setAngle(45);
            }
        } else {
            this.car.setVelocityY(0);
        }

        this.carShadow.x = this.car.x - 7;
        this.carShadow.y = this.car.y - 7;

        if (this.currentFolder && Phaser.Math.Distance.Between(this.car.x, this.car.y, this.currentFolder.x, this.currentFolder.y) > 100) {
            this.cleanupText();
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
            if (this.folderText && this.currentFolder) {
                this.scene.start(this.currentSceneKey);  // Start the scene associated with the current folder
                this.cleanupText();
            }
        }
        
    }
    
    onReachFolder(car, folder) {
        if (folder.texture.key === 'folderLocked') {
            return;
        }

        if (!this.folderText) {
            this.currentFolder = folder;
            this.currentSceneKey = folder.sceneKey;  // Save the scene key associated with the folder
            let textComponents = this.createTypewriterText(
                'Press SPACE to Solve Puzzle',
                folder.x - folder.width * folder.scaleX / 2 - 100,
                folder.y - folder.height * folder.scaleY / 2 - 20,
                { fill: '#000' }
            );
            this.folderText = textComponents;
        }
    }
    
    cleanupText() {
        if (this.folderText) {
            if (this.folderText.typewriterEvent) {
                this.folderText.typewriterEvent.remove(false);
            }
            this.folderText.textObject.destroy();
            this.folderText = null;
        }
    }

    createTypewriterText(text, x, y, style) {
        let textObject = this.add.text(x, y, '', style);
        let index = 0;
        let typewriterEvent = this.time.addEvent({
            delay: 50,
            repeat: text.length - 1,
            callback: () => {
                textObject.setText(text.substring(0, index + 1));
                index++;
                if (index === text.length) {
                    textObject.setInteractive().on('pointerdown', () => {
                        if (this.currentFolder) {
                            let sceneKey = this.currentFolder.texture.key;
                            this.scene.start(sceneKey);
                            this.cleanupText();
                        }
                    });
                }
            },
            callbackScope: this
        });
        return { textObject, typewriterEvent };
    }
}

class Inter1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Inter1' });
    }

    preload() {
        this.load.image('car', 'miata.png');
        this.load.image('folder', 'folder.png');
        this.load.image('p', 'p-paper.png');
        this.load.image('r', 'r-paper.png');
        this.load.image('o', 'o-paper.png');
        this.load.image('m', 'm-paper.png');
        this.load.image('folderLocked', 'lock.png');
        this.load.image('carShadow', 'miataShadow.png');
        this.load.image('background2', 'bg3.png');
    }

    create() { 
        this.bg = this.physics.add.staticGroup();
        let background = this.bg.create(300, 200, 'background2').setScale(0.9).setDepth(-2);

        this.cameras.main.setBackgroundColor('#e2fede');
        this.car = this.physics.add.sprite(300, -180, 'car').setScale(0.3).setDepth(2);
        this.carShadow = this.physics.add.sprite(-5, -5, 'carShadow').setScale(0.3).setDepth(1).setAlpha(0.5);
        this.car.setAngle(90);
        this.carShadow.setAngle(90);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        
        // Folders setup
        this.folders = this.physics.add.staticGroup();
        let folder1 = this.folders.create(300, 200, 'folder').setScale(0.22);
        folder1.sceneKey = 'PuzzleScene1';

        // Overlap events
        this.physics.add.overlap(this.car, this.folders, this.onReachFolder, null, this);
    
        // To handle text removal when moving away
        this.currentFolder = null;  // Track the current folder

        this.cameras.main.startFollow(this.car, true, 0.05, 0.05);
        this.cameras.main.setZoom(1);
    
    }

    update() {
        // Handle car movement and background scrolling
        if (this.cursors.left.isDown) {
            this.car.setAngle(180).setVelocityX(-360);
            this.carShadow.setAngle(180);
        } else if (this.cursors.right.isDown) {
            this.car.setAngle(0).setVelocityX(360);
            this.carShadow.setAngle(0);
        } else {
            this.car.setVelocityX(0);
        }
        
        if (this.cursors.up.isDown) {
            this.car.setAngle(-90).setVelocityY(-360);
            this.carShadow.setAngle(-90);
            if (this.cursors.right.isDown && this.cursors.up.isDown) {
                this.car.setAngle(-45);
                this.carShadow.setAngle(-45);
            }
            if (this.cursors.left.isDown && this.cursors.up.isDown) {
                this.car.setAngle(-135);
                this.carShadow.setAngle(-135);
            }
        } else if (this.cursors.down.isDown) {
            this.car.setAngle(90).setVelocityY(360);
            this.carShadow.setAngle(90);
            if (this.cursors.down.isDown && this.cursors.left.isDown) {
                this.car.setAngle(135);
                this.carShadow.setAngle(135);
            }
            if (this.cursors.down.isDown && this.cursors.right.isDown) {
                this.car.setAngle(45);
                this.carShadow.setAngle(45);
            }
        } else {
            this.car.setVelocityY(0);
        }

        this.carShadow.x = this.car.x - 7;
        this.carShadow.y = this.car.y - 7;

        if (this.currentFolder && Phaser.Math.Distance.Between(this.car.x, this.car.y, this.currentFolder.x, this.currentFolder.y) > 100) {
            this.cleanupText();
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
            if (this.folderText && this.currentFolder) {
                this.scene.start(this.currentSceneKey);  // Start the scene associated with the current folder
                this.cleanupText();
            }
        }
        
    }
    
    onReachFolder(car, folder) {
        if (folder.texture.key === 'folderLocked') {
            return;
        }

        if (!this.folderText) {
            this.currentFolder = folder;
            this.currentSceneKey = folder.sceneKey;  // Save the scene key associated with the folder
            let textComponents = this.createTypewriterText(
                'Press SPACE to Solve Puzzle',
                folder.x - folder.width * folder.scaleX / 2 - 100,
                folder.y - folder.height * folder.scaleY / 2 - 20,
                { fill: '#000' }
            );
            this.folderText = textComponents;
        }
    }
    
    cleanupText() {
        if (this.folderText) {
            if (this.folderText.typewriterEvent) {
                this.folderText.typewriterEvent.remove(false);
            }
            this.folderText.textObject.destroy();
            this.folderText = null;
        }
    }

    createTypewriterText(text, x, y, style) {
        let textObject = this.add.text(x, y, '', style);
        let index = 0;
        let typewriterEvent = this.time.addEvent({
            delay: 50,
            repeat: text.length - 1,
            callback: () => {
                textObject.setText(text.substring(0, index + 1));
                index++;
                if (index === text.length) {
                    textObject.setInteractive().on('pointerdown', () => {
                        if (this.currentFolder) {
                            let sceneKey = this.currentFolder.texture.key;
                            this.scene.start(sceneKey);
                            this.cleanupText();
                        }
                    });
                }
            },
            callbackScope: this
        });
        return { textObject, typewriterEvent };
    }
}

class Inter2 extends Phaser.Scene {
    constructor() {
        super({ key: 'Inter2' });
    }

    preload() {
        this.load.image('car', 'miata.png');
        this.load.image('folder', 'folder.png');
        this.load.image('p', 'p-paper.png');
        this.load.image('r', 'r-paper.png');
        this.load.image('o', 'o-paper.png');
        this.load.image('m', 'm-paper.png');
        this.load.image('folderLocked', 'lock.png');
        this.load.image('carShadow', 'miataShadow.png');
        this.load.image('background3', 'bg2.png');
    }

    create() { 
        this.bg = this.physics.add.staticGroup();
        let background = this.bg.create(300, 200, 'background3').setScale(0.9).setDepth(-2);

        this.cameras.main.setBackgroundColor('#f1f4eb');
        this.car = this.physics.add.sprite(-570, 190, 'car').setScale(0.3).setDepth(2);
        this.carShadow = this.physics.add.sprite(-5, -5, 'carShadow').setScale(0.3).setDepth(1).setAlpha(0.5);
        this.car.setAngle(0);
        this.carShadow.setAngle(0);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        
        // Folders setup
        this.folders = this.physics.add.staticGroup();
        let folder2 = this.folders.create(1020, 190, 'folder').setScale(0.2);
        folder2.sceneKey = 'PuzzleScene2';

        // Overlap events
        this.physics.add.overlap(this.car, this.folders, this.onReachFolder, null, this);
    
        // To handle text removal when moving away
        this.currentFolder = null;  // Track the current folder

        this.cameras.main.startFollow(this.car, true, 0.05, 0.05);
        this.cameras.main.setZoom(1);
    
    }

    update() {
        // Handle car movement and background scrolling
        if (this.cursors.left.isDown) {
            this.car.setAngle(180).setVelocityX(-360);
            this.carShadow.setAngle(180);
        } else if (this.cursors.right.isDown) {
            this.car.setAngle(0).setVelocityX(360);
            this.carShadow.setAngle(0);
        } else {
            this.car.setVelocityX(0);
        }
        
        if (this.cursors.up.isDown) {
            this.car.setAngle(-90).setVelocityY(-360);
            this.carShadow.setAngle(-90);
            if (this.cursors.right.isDown && this.cursors.up.isDown) {
                this.car.setAngle(-45);
                this.carShadow.setAngle(-45);
            }
            if (this.cursors.left.isDown && this.cursors.up.isDown) {
                this.car.setAngle(-135);
                this.carShadow.setAngle(-135);
            }
        } else if (this.cursors.down.isDown) {
            this.car.setAngle(90).setVelocityY(360);
            this.carShadow.setAngle(90);
            if (this.cursors.down.isDown && this.cursors.left.isDown) {
                this.car.setAngle(135);
                this.carShadow.setAngle(135);
            }
            if (this.cursors.down.isDown && this.cursors.right.isDown) {
                this.car.setAngle(45);
                this.carShadow.setAngle(45);
            }
        } else {
            this.car.setVelocityY(0);
        }

        this.carShadow.x = this.car.x - 7;
        this.carShadow.y = this.car.y - 7;

        if (this.currentFolder && Phaser.Math.Distance.Between(this.car.x, this.car.y, this.currentFolder.x, this.currentFolder.y) > 100) {
            this.cleanupText();
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
            if (this.folderText && this.currentFolder) {
                this.scene.start(this.currentSceneKey);  // Start the scene associated with the current folder
                this.cleanupText();
            }
        }
        
    }
    
    onReachFolder(car, folder) {
        if (folder.texture.key === 'folderLocked') {
            return;
        }

        if (!this.folderText) {
            this.currentFolder = folder;
            this.currentSceneKey = folder.sceneKey;  // Save the scene key associated with the folder
            let textComponents = this.createTypewriterText(
                'Press SPACE to Solve Puzzle',
                folder.x - folder.width * folder.scaleX / 2 - 100,
                folder.y - folder.height * folder.scaleY / 2 - 55,
                { fill: '#000' }
            );
            this.folderText = textComponents;
        }
    }
    
    cleanupText() {
        if (this.folderText) {
            if (this.folderText.typewriterEvent) {
                this.folderText.typewriterEvent.remove(false);
            }
            this.folderText.textObject.destroy();
            this.folderText = null;
        }
    }

    createTypewriterText(text, x, y, style) {
        let textObject = this.add.text(x, y, '', style);
        let index = 0;
        let typewriterEvent = this.time.addEvent({
            delay: 50,
            repeat: text.length - 1,
            callback: () => {
                textObject.setText(text.substring(0, index + 1));
                index++;
                if (index === text.length) {
                    textObject.setInteractive().on('pointerdown', () => {
                        if (this.currentFolder) {
                            let sceneKey = this.currentFolder.texture.key;
                            this.scene.start(sceneKey);
                            this.cleanupText();
                        }
                    });
                }
            },
            callbackScope: this
        });
        return { textObject, typewriterEvent };
    }
}

class Inter3 extends Phaser.Scene {
    constructor() {
        super({ key: 'Inter3' });
    }

    preload() {
        this.load.image('car', 'miata.png');
        this.load.image('folder', 'folder.png');
        this.load.image('p', 'p-paper.png');
        this.load.image('r', 'r-paper.png');
        this.load.image('o', 'o-paper.png');
        this.load.image('m', 'm-paper.png');
        this.load.image('folderLocked', 'lock.png');
        this.load.image('carShadow', 'miataShadow.png');
        this.load.image('background4', 'bg4.png');
    }

    create() { 
        this.bg = this.physics.add.staticGroup();
        let background = this.bg.create(300, 200, 'background4').setScale(0.9).setDepth(-2);

        this.cameras.main.setBackgroundColor('#e2fede');
        this.car = this.physics.add.sprite(300, -180, 'car').setScale(0.3).setDepth(2);
        this.carShadow = this.physics.add.sprite(-5, -5, 'carShadow').setScale(0.3).setDepth(1).setAlpha(0.5);
        this.car.setAngle(90);
        this.carShadow.setAngle(90);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        
        // Folders setup
        this.folders = this.physics.add.staticGroup();
        let folder3 = this.folders.create(300, 200, 'folder').setScale(0.2);
        folder3.sceneKey = 'PuzzleScene3';

        // Overlap events
        this.physics.add.overlap(this.car, this.folders, this.onReachFolder, null, this);
    
        // To handle text removal when moving away
        this.currentFolder = null;  // Track the current folder

        this.cameras.main.startFollow(this.car, true, 0.05, 0.05);
        this.cameras.main.setZoom(1);
    
    }

    update() {
        // Handle car movement and background scrolling
        if (this.cursors.left.isDown) {
            this.car.setAngle(180).setVelocityX(-360);
            this.carShadow.setAngle(180);
        } else if (this.cursors.right.isDown) {
            this.car.setAngle(0).setVelocityX(360);
            this.carShadow.setAngle(0);
        } else {
            this.car.setVelocityX(0);
        }
        
        if (this.cursors.up.isDown) {
            this.car.setAngle(-90).setVelocityY(-360);
            this.carShadow.setAngle(-90);
            if (this.cursors.right.isDown && this.cursors.up.isDown) {
                this.car.setAngle(-45);
                this.carShadow.setAngle(-45);
            }
            if (this.cursors.left.isDown && this.cursors.up.isDown) {
                this.car.setAngle(-135);
                this.carShadow.setAngle(-135);
            }
        } else if (this.cursors.down.isDown) {
            this.car.setAngle(90).setVelocityY(360);
            this.carShadow.setAngle(90);
            if (this.cursors.down.isDown && this.cursors.left.isDown) {
                this.car.setAngle(135);
                this.carShadow.setAngle(135);
            }
            if (this.cursors.down.isDown && this.cursors.right.isDown) {
                this.car.setAngle(45);
                this.carShadow.setAngle(45);
            }
        } else {
            this.car.setVelocityY(0);
        }

        this.carShadow.x = this.car.x - 7;
        this.carShadow.y = this.car.y - 7;

        if (this.currentFolder && Phaser.Math.Distance.Between(this.car.x, this.car.y, this.currentFolder.x, this.currentFolder.y) > 100) {
            this.cleanupText();
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
            if (this.folderText && this.currentFolder) {
                this.scene.start(this.currentSceneKey);  // Start the scene associated with the current folder
                this.cleanupText();
            }
        }
        
    }
    
    onReachFolder(car, folder) {
        if (folder.texture.key === 'folderLocked') {
            return;
        }

        if (!this.folderText) {
            this.currentFolder = folder;
            this.currentSceneKey = folder.sceneKey;  // Save the scene key associated with the folder
            let textComponents = this.createTypewriterText(
                'Press SPACE to Solve Puzzle',
                folder.x - folder.width * folder.scaleX / 2 - 100,
                folder.y - folder.height * folder.scaleY / 2 - 20,
                { fill: '#000' }
            );
            this.folderText = textComponents;
        }
    }
    
    cleanupText() {
        if (this.folderText) {
            if (this.folderText.typewriterEvent) {
                this.folderText.typewriterEvent.remove(false);
            }
            this.folderText.textObject.destroy();
            this.folderText = null;
        }
    }

    createTypewriterText(text, x, y, style) {
        let textObject = this.add.text(x, y, '', style);
        let index = 0;
        let typewriterEvent = this.time.addEvent({
            delay: 50,
            repeat: text.length - 1,
            callback: () => {
                textObject.setText(text.substring(0, index + 1));
                index++;
                if (index === text.length) {
                    textObject.setInteractive().on('pointerdown', () => {
                        if (this.currentFolder) {
                            let sceneKey = this.currentFolder.texture.key;
                            this.scene.start(sceneKey);
                            this.cleanupText();
                        }
                    });
                }
            },
            callbackScope: this
        });
        return { textObject, typewriterEvent };
    }
}

class PuzzleScene1 extends Phaser.Scene {
    constructor() {
        super({ key: 'PuzzleScene1' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#010F10');

        this.introText = this.add.text(200, 50, '', { font: '28px Courier', fill: '#FFFFFF' });
        this.typewriterText("Puzzle 1:", this.introText, 50).then(() => {
            this.createBinaryPuzzle();
        });

        this.hint = this.add.text(200, 100, '', { font: '28px Courier', fill: '#FFFFFF' });
        this.typewriterText("62180137", this.hint, 50).then(() => {
            this.createBinaryPuzzle();
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MainScene');
        });
    }

    typewriterText(text, textObject, delay) {
        return new Promise((resolve) => {
            let length = text.length;
            let i = 0;
            this.time.addEvent({
                callback: () => {
                    textObject.text += text[i];
                    i++;
                    if (i === length) {
                        resolve();
                    }
                },
                repeat: length - 1,
                delay: delay
            });
        });
    }    
       

    createBinaryPuzzle() {
        let binaryRGB = {
            red: '00111110',
            green: '10110100',
            blue: '10001001'
        };
        let colors = {
            red: 0xff0000,
            green: 0x00ff00,
            blue: 0x0000ff
        };
        let yPos = 140; // Start position for the first row  
        let delay = 0; // Start with no delay for the first box
    
        Object.keys(binaryRGB).forEach((color, row) => {
            let xPos = 200; // Reset xPos for each row
            binaryRGB[color].split('').forEach((bit, index) => {
                this.time.delayedCall(delay, () => {
                    let boxColor = bit === '1' ? colors[color] : 0x010F10;
                    let graphics = this.add.graphics({ fillStyle: { color: boxColor } });
                    graphics.fillRoundedRect(xPos, yPos, 40, 40, 8);
                    if (index === binaryRGB[color].length - 1 && row === Object.keys(binaryRGB).length - 1) {
                        // Last box of the last row
                        this.createInputField();
                    }
                    xPos += 50; // Move to the right for the next box
                    if (index === binaryRGB[color].length - 1) {
                        yPos += 50; // Move down for the next row
                    }
                }, [], this);
                delay += 100; // Increase delay for the next box
            });
        });
    }
    
    

    createInputField() {
        this.time.delayedCall(300, () => {  // Delay to ensure it appears after all boxes
            let promptText = this.add.text(200, 320, '', { font: '20px Courier', fill: '#ffffff' });
            this.typewriterText('Enter the solution here:', promptText, 50).then(() => {
                let inputText = this.add.text(200, 340, '', { font: '20px Courier', fill: '#00ff00', backgroundColor: '#010F10' });
                let cursor = this.add.rectangle(inputText.x + inputText.width + 2, inputText.y + 5, 2, inputText.height - 10, 0xffffff).setOrigin(0);
                this.time.addEvent({
                    delay: 530,
                    callback: () => { cursor.visible = !cursor.visible; },
                    loop: true
                });
    
                this.input.keyboard.on('keydown', (event) => {
                    if (event.keyCode === 8 && inputText.text.length > 0) {  // Backspace key
                        inputText.text = inputText.text.substr(0, inputText.text.length - 1);
                    } else if (event.keyCode === 13) {  // Enter key
                        if (inputText.text.toLowerCase() === 'mint') {
                            promptText.setText('Correct!');
                            this.registry.set('puzzle1Completed', true);
                        } else {
                            promptText.setText('Incorrect, try again.');
                            inputText.text = '';
                        }
                    } else if (event.key.match(/^[a-z]$/i)) {  // Allow alphabetical input
                        inputText.text += event.key;
                    }
                    cursor.x = inputText.x + inputText.width + 2;  // Update cursor position
                });
            });
        });
    }
    
}

class PuzzleScene2 extends Phaser.Scene {
    constructor() {
        super({ key: 'PuzzleScene2' });
    }

    preload() {
        this.load.image('colortest', 'ishihara (2).png');
    }

    create() {
        this.cameras.main.setBackgroundColor('#FFFFFF');

        this.add.image(755, 300, 'colortest').setScale(0.5);


        this.introText = this.add.text(675, 30, '', { font: '28px Courier', fill: '#000000', fontStyle: 'boldest'});
        this.typewriterText("Puzzle 2:", this.introText, 50).then(() => {
            this.hint1 = this.add.text(670, 550, '', { font: '20px Courier', fill: '#000000', fontStyle: 'boldest'});
            this.hint2 = this.add.text(680, 570, '', { font: '20px Courier', fill: '#000000', fontStyle: 'boldest'});
            this.hint3 = this.add.text(665, 590, '', { font: '20px Courier', fill: '#000000', fontStyle: 'boldest'});
            this.typewriterText('Solution = 9', this.hint1, 50).then(() => {
                this.typewriterText('9 = (4 + 5)', this.hint2, 50).then(() => {
                    this.typewriterText('5 = s - - - -', this.hint3, 50).then(() => {
                        this.createInputField(); 
                    });
                });
            });
        });




        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MainScene');
        });
    }

    typewriterText(text, textObject, delay) {
        return new Promise((resolve) => {
            let length = text.length;
            let i = 0;
            this.time.addEvent({
                callback: () => {
                    textObject.text += text[i];
                    i++;
                    if (i === length) {
                        resolve();
                    }
                },
                repeat: length - 1,
                delay: delay
            });
        });
    }    

    createInputField() { // Delay to ensure it appears after all boxes
            let promptText = this.add.text(600, 630, '', { font: '20px Courier', fill: '#000000' });
            this.typewriterText('Enter the solution here:', promptText, 50).then(() => {
                let inputText = this.add.text(600, 650, '', { font: '20px Courier', fill: '#00ff00', backgroundColor: '#FFFFFF' });
                let cursor = this.add.rectangle(inputText.x + inputText.width + 2, inputText.y + 5, 2, inputText.height - 10, 0xffffff).setOrigin(0);
                this.time.addEvent({
                    delay: 530,
                    callback: () => { cursor.visible = !cursor.visible; },
                    loop: true
                });
    
                this.input.keyboard.on('keydown', (event) => {
                    if (event.keyCode === 8 && inputText.text.length > 0) {  // Backspace key
                        inputText.text = inputText.text.substr(0, inputText.text.length - 1);
                    } else if (event.keyCode === 13) {  // Enter key
                        if (inputText.text.toLowerCase() === 'pilestone') {
                            promptText.setText('Correct!');
                            this.registry.set('puzzle2Completed', true)
                        } else {
                            promptText.setText('Incorrect, try again.');
                            inputText.text = '';
                        }
                    } else if (event.key.match(/^[a-z]$/i)) {  // Allow alphabetical input
                        inputText.text += event.key;
                    }
                    cursor.x = inputText.x + inputText.width + 2;  // Update cursor position
                });
            });
    }

}

class PuzzleScene3 extends Phaser.Scene {
    constructor() {
        super({ key: 'PuzzleScene3' });
    }

    create() {
        this.createTypewriterText("Solve Puzzle 3 Here", 400, 300);
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MainScene');
        });
    }

    createTypewriterText(text, x, y) {
        let displayText = this.add.text(x, y, '', { font: '16px Courier', fill: '#fff' });
        let index = 0;
        this.time.addEvent({
            delay: 100, // ms between characters
            repeat: text.length - 1,
            callback: () => {
                displayText.setText(text.substring(0, index + 1));
                index++;
            }
        });
    }
}

class PuzzleScene4 extends Phaser.Scene {
    constructor() {
        super({ key: 'PuzzleScene4' });
    }

    create() {
        this.createTypewriterText("Solve Puzzle 4 Here", 400, 300);
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MainScene');
        });
    }

    createTypewriterText(text, x, y) {
        let displayText = this.add.text(x, y, '', { font: '16px Courier', fill: '#fff' });
        let index = 0;
        this.time.addEvent({
            delay: 100, // ms between characters
            repeat: text.length - 1,
            callback: () => {
                displayText.setText(text.substring(0, index + 1));
                index++;
            }
        });
    }
}

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.AUTO,
        parent: 'body',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1500, // Adjust based on your needs
        height: 800
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [BootScene, MainScene, Inter1, PuzzleScene1, Inter2, PuzzleScene2, Inter3, PuzzleScene3, PuzzleScene4]
};
let game = new Phaser.Game(config);