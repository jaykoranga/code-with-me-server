const { uniqueNamesGenerator, adjectives, NumberDictionary , animals } = require('unique-names-generator');

const numberDictionary = NumberDictionary.generate({ min: 100, max: 9999 });
const userNameConfig={
    dictionaries:[['Coder'],animals,numberDictionary],
    seperator:'-'
}
const generateUniqueUserName=()=>{
     return uniqueNamesGenerator(userNameConfig)
}

const roomNameConfig={
    dictionaries:[['Room'],['of'],adjectives],
    seperator:' '
}
const generateUniqueRoomName = ()=>{
    return uniqueNamesGenerator(roomNameConfig)
}
 module.exports={generateUniqueUserName,generateUniqueRoomName}