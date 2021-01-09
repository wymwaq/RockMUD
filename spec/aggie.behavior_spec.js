const MOCK_SERVER = require('../mocks/mock_server');
let mud;

xdescribe('Testing: AGGIE BEHAVIOR', () => {
    let combatLoop;
    let cmdLoop;
    let mockPlayer;
    let wolf;
    let wolf2;
    let wolfRoom;
    let mockPlayerRoom;
    let mockPlayerArea;
    let server;

    beforeEach((done) => {
        mud = new MOCK_SERVER(() => {
            server = mud.server;
 
            cmdLoop = spyOn(server.world.ticks, 'cmdLoop').and.callThrough();
            combatLoop = spyOn(server.world.ticks, 'combatLoop').and.callThrough();

            jasmine.clock().install();

            mud.createNewEntity((playerModel) => {
                mud.createNewEntity((wolfModel) => {
                    mud.createNewEntity((wolf2Model) => {
                        mockPlayer = playerModel;
                        mockPlayer.refId = 'unit-test-player'
                        mockPlayer.area = 'midgaard';
                        mockPlayer.originatingArea = mockPlayer.area;
                        mockPlayer.roomid = '1';
                        mockPlayer.isPlayer = true;
                        mockPlayer.level = 1;
                        mockPlayer.name = 'Bilbo';
                        mockPlayer.displayName = 'Bilbo';
                        mockPlayer.combatName = 'Bilbo';
                        mockPlayer.chp = 100;

                        wolf = wolfModel;
                        wolf.area = 'midgaard';
                        wolf.originatingArea = mockPlayer.area;
                        wolf.roomid = '2'; // north of player
                        wolf.level = 1;
                        wolf.isPlayer = false;
                        wolf.name = 'wolf';
                        wolf.displayName = 'Wolf';
                        wolf.combatName = 'Wolf';
                        wolf.refId = 'wolf-refid';
                        wolf.cmv = 100;
                        wolf.mv = 100;
                        wolf.hp = 100;
                        wolf.chp = 1;
                        wolf.refId = 'b';

                        wolf2 = wolf2Model;
                        wolf2.area = 'midgaard';
                        wolf2.originatingArea = mockPlayer.area;
                        wolf2.roomid = '2'; // north of player
                        wolf2.level = 1;
                        wolf2.isPlayer = false;
                        wolf2.name = 'wolf2';
                        wolf2.combatName = 'Wolf2';
                        wolf2.displayName = 'Wolf2';
                        wolf2.refId = 'wolf2-refid';
                        wolf2.cmv = 100;
                        wolf2.mv = 100;
                        wolf2.hp = 100;
                        wolf2.chp = 1;
                        wolf2.refId = 'a';

                        mockPlayerArea = server.world.getArea(mockPlayer.area);

                        mockPlayerRoom = server.world.getRoomObject(mockPlayer.area, mockPlayer.roomid);

                        mockPlayerRoom.playersInRoom.push(mockPlayer);

                        wolfRoom = server.world.getRoomObject(wolf.area, wolf.roomid);

                        wolfRoom.monsters = [];

                        server.world.players.push(mockPlayer);

                        done();
                    }, [{
                        module: 'aggie'
                    }]);
                }, [{
                    module: 'aggie'
                }]);
            });
        }, false, false);
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should simulate player walking into a room and being attacked by a wolf', () => {
        mockPlayer.hitroll = 20; // beats the default entity AC of 10 so we always hit
        
        wolfRoom.monsters.push(wolf);
        wolfRoom.monsters.push(wolf2);

        setInterval(function() {
            server.world.ticks.cmdLoop();
        }, 280);

        setInterval(function() {
            server.world.ticks.combatLoop(server.world.battles);
        }, 1900);

        expect(cmdLoop).not.toHaveBeenCalled();
        expect(combatLoop).not.toHaveBeenCalled();

        jasmine.clock().tick(280);
       
        expect(cmdLoop).toHaveBeenCalledTimes(1);

        let cmd = server.world.commands.createCommandObject({
            msg: 'move north'
        });

        server.world.addCommand(cmd, mockPlayer);

        jasmine.clock().tick(280); // 560

        jasmine.clock().tick(280); // onVisit issues kill command

        jasmine.clock().tick(1060); // trigger combat loop
        
        expect(combatLoop).toHaveBeenCalled();

        expect(server.world.battles.length).toBe(1);

        // defeat the wolf
        while (wolf.fighting) {
            jasmine.clock().tick(1900); // trigger combat loop
        }

        expect(wolf.chp).toBe(0);
        expect(wolfRoom.monsters.length).toBe(1);
        expect(server.world.battles.length).toBe(1);
        expect(server.world.battles[0].positions['0']).toBe(null);
        expect(server.world.battles[0].positions['1'].attacker.name).toBe('wolf2');
        expect(server.world.battles[0].positions['1'].defender.name).toBe('Bilbo');
        expect(server.world.battles[0].positions['2']).toBe(undefined);

        while (wolf2.fighting) {
            jasmine.clock().tick(1900); // trigger combat loop
        }

        expect(wolf2.chp).toBe(0);
        expect(wolfRoom.monsters.length).toBe(0);
        expect(server.world.battles.length).toBe(0);
    });
});
