var csv_export = require('csv-export');
var fs = require('fs');
const Command = require('command');

let members = {};
const fieldNamesArray = ['name', 'playerID', 'rank', 'level', 'contributionCurrent', 'contributionTotal', 'note'];

module.exports = function GuildMembers(dispatch) {
  const command = Command(dispatch);

  dispatch.hook('S_LOGIN', 14, (event) => {
    members = {};
    //dispatch.toServer('C_REQUEST_GUILD_MEMBER_LIST', 1, {});
  });

  dispatch.hook('S_GUILD_MEMBER_LIST', 1, (event) => {
    //members = [];
    //console.log(event);
    for(var i = 0; i < event.members.length; i++) {
      var member = {};

      for(var j = 0; j < fieldNamesArray.length; j++)
        member[fieldNamesArray[j]] = event.members[i][fieldNamesArray[j]];

      member['gender'] = event.members[i]['gender'] ? 'Female' : 'Male';
      member['class'] = className(event.members[i]['class']);
      member['race'] = raceName(event.members[i]['race'], event.members[i]['gender']);
      if(event.members[i]['status'] > 1) {
        member['status'] = 'Offline';
        member['lastOnline'] = event.members[i]['lastOnline'];
      }
      else {
        member['status'] = 'Online';
        member['lastOnline'] = 0;
      }

      //console.log(member);
      members[member['name']] = member;
    }
  });

  command.add('guildexport', () => {
    if(members) {
      //console.log(members.length);
      membersArr = [];
      for(let i = 0; i < Object.keys(members).length; i++){
        membersArr.push(members[Object.keys(members)[i]]);
      }
      //onsole.log(membersArr);
      csv_export.export(membersArr, function(buffer){
        fs.writeFileSync('./memberlist.zip',buffer);

      });
    }
    else {
      //dispatch.toServer('C_REQUEST_GUILD_MEMBER_LIST', 1, {});
      dispatch.toClient('S_CHAT', 3, {
        channel: 21, //21 = p-notice, 1 = party
        authorName: 'CSV-export',
        message: 'Error: Open your guild menu and try again.'
      });
    }

    return false;
	});


  function className(classInt){
      var className;

      switch(classInt + 1) {
        case 1: className = 'Warrior'; break;
        case 2: className = 'Lancer'; break;
        case 3: className = 'Slayer'; break;
        case 4: className = 'Berserker'; break;
        case 5: className = 'Sorcerer'; break;
        case 6: className = 'Archer'; break;
        case 7: className = 'Priest'; break;
        case 8: className = 'Mystic'; break;
        case 9: className = 'Reaper'; break;
        case 10: className = 'Gunner'; break;
        case 11: className = 'Brawler'; break;
        case 12: className = 'Ninja'; break;
        case 13: className = 'Valkyrie'; break;
        default: className = 'UNKNOWN_CLASS';
      }

      return className;
  }

  function raceName(raceInt, gender){
      var raceName;

      switch(raceInt) {
        case 0: raceName = 'Human'; break;
        case 1: raceName = 'High Elf'; break;
        case 2: raceName = 'Aman'; break;
        case 3: raceName = 'Castanic'; break;
        case 4: raceName = 'Popori'; break;
        case 5: raceName = 'Baraka'; break;
        default: raceName = 'UNKNOWN_RACE';
      }

      if(gender && raceInt == 4)
        raceName = 'Elin';

      return raceName;
  }
}
