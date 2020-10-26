# msg-localize
> Module for localizing messages. Can be used in bots, probably for websites.


[![NPM version][npm-image]][npm-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]


## Installation

```
npm install msg-localize --save
```

## Usage

Create a folder where your localization files will be stored. For example the folder `./languages`. Within this folder, create subfolders to localize various scripts for your application. For example, to localize a simple telegram bot, I created the folders `./languages/start` and`./languages​/weather` for the scripts of the commands `/start` and`/weather`, respectively. Localization files in the format `*.json` or [*.hjson](https://www.npmjs.com/package/hjson) must be placed in these folders. In each of them for English and Russian, I put files `./languages​/start/en_US.json`,`./languages​​/start/ru_RU.json`, `./languages​/weather/en_US.json` and`./languages/weather/ru_RU.json`. For example, I will give 2 of them:

**./languages/start/en_US.json**
```JSON
{
    "welcome": [
        "${name}, greetings",
        "${name} hello",
        "${name}, nice to see you",
    ],
    "info": {
        "simple": "Here you can check the current weather. For a detailed description of the features, enter the command / help",
        "help": [
            "To find out the weather, use the /weather {city} command\n",
            "where {city} is the name of the settlement you are interested in\n",
            "You can also list several localities\n",
            "Here are some examples:\n",
            "/weather London\n",
            "/weather Washington acapulco\n"
        ]
    }
}
```

**./languages/start/ru_RU.json**
```JSON
{
    "welcome": [
        "${name}, приветствую вас",
        "${name}, здравствуйте",
        "${name}, рад вас видеть",
    ],
    "info":{
        "simple": "Здесь вы можете узнать текущую погоду. Для подробного описания возможностей введите команду /help",
        "help": [
            "Для того чтобы узнать погоду необходимо воспользоваться командой /weather {city}\n",
            "где {city} это название интересующего вас населенного пункта\n",
            "Так-же вы можете перечислить несколько населенных пунктов\n",
            "Вот несколько примеров:\n",
            "/weather London\n",
            "/weather Washington acapulco\n"
        ]
    }
}
```
* /if you wish, you can make translations into all languages ​​of the world, but unfortunately I'm not a polyglot/


#### Everything is now ready to use. Let's get started:


```javascript
// connect the localization module
const Messages = require('msg-localize');

// load localization files for the start script (commands /start and /help)
// and set the default localization. This will download the localization 
// files all present in the folder `./languages/start`
const startMessages = new Messages("./languages/start","en_US");

// we will receive a welcome message
const text = messages.getMessage("welcome.*", {name: "Alexander"});
console.log(text);
    // for example, I print messages to the console.
    // will display one of the following messages (the choice of message is random):
    //    "Alexander, greetings"
    //    "Alexander hello"
    //    "Alexander, nice to see you"

...

// then I want to acquaint the user with a brief description of the bot's capabilities
const text = messages.getMessage("info.simple");
console.log(text);
    // will output the following:
    //    "Here you can check the current weather. For a detailed description of the features, enter the command /help"

// if the user's language differs from the default language, 
// then we can specify it explicitly, taking the user's 
// language from his data. You can do it like this:
// `messages.getMessage("info.help", "ru_RU");`
// or so:
// `messages.getMessage("welcome.*", {name: "Alexander"}, "ru_RU");`
const text = messages.getMessage("info.help", "ru_RU"); 
console.log(text);
    // will output the following:
    //    "Здесь вы можете узнать текущую погоду. Для подробного описания возможностей введите команду /help"


// when the user enters the command /help, you need to send
// him a full description of the bot's capabilities
const text = messages.getMessage("info.help");
console.log(text);
    // will output the following text (broken line by line):
    //    "To find out the weather, use the /weather {city} command
    //     where {city} is the name of the settlement you are interested in
    //     You can also list several localities
    //     Here are some examples:
    //     /weather London
    //     /weather Washington acapulco"
```


## Exstended samples
The capabilities of this module are somewhat wider than shown above, then you can familiarize yourself with them


#### for example, let's take such a localization file
```JSON
{
    "like": {
        "pets": "I really love animals, I have ${pet1} and ${pet2} at home",
        "randomPets": "I really love animals, I have ${pets.*} and ${pets.*} at home",
        "met": "I like you ${options}",
        "but": "you are too poor for me",
        "but`s": [
            "you are too poor for me",
            "i prefer to have sex with girls",
            "i am a married woman"
        ],
    },
    "about": "My name is ${sname} ${name}, I am a ${profession}.",
    "reqursion": "${insert}"

}


#### examples of many additional features provided by the module
```javascript
// passing substitution parameters
const text = messages.getMessage("like.pets",{pet1:"a kitten", pet2:"a puppy"});
console.log(text);
    // will output the following text:
    //   "I really love animals, I have a kitten and a puppy at home"


// passing parameters and their random substitution
const text = messages.getMessage("like.randomPets",{pets: [ "a kitten", "a puppy", "a duck", "a parrot", "a canary", "a guinea pig", "a hamster", "a raccoon" "a skunk"]});
console.log(text);
    // will output the following text (the choice of pets is random):
    //   "I really love animals, I have a kitten and a puppy at home"
    // or
    //   "I really love animals, I have a parrot and a raccoon at home"
    // or
    //   "I really love animals, I have a skunk and a kitten at home"
    // etc


// recursive parameter substitution
const text = messages.getMessage("like.pets",{options:"but ${like.but}"});
console.log(text);
    // will output the following text:
    //   "I like you but you are too poor for me"


// recursive substitution of random parameters
const text = messages.getMessage("like.pets",{options:"but ${like.but`s.*}"});
console.log(text);
    // will output the following text (the choice of "but" is random)::
    //   "I like you but you are too poor for me"
    // or
    //   "I like you but i prefer to have sex with girls"
    // or
    //   "I like you but i am a married woman"


// multiple parameter substitution
const text = messages.getMessage("about",{name:"Nelson", sname:"Horatio", profession:"naval admiral"});
console.log(text);
    // will output the following text:
    //   "My name is Horatio Nelson, I am a naval admiral."


// also this module automatically tracks closed recursion (when the message replaces itself)
const text = messages.getMessage("reqursion",{insert:"${reqursion}"});
console.log(text);
    // will output the following text:
    //   "    !!!! FIND RECURSION FOR DEEPKEY: reqursion!!!!    "
```

... documentation in processed

## Tests
[Tests](http://jsfiddle.net/zb0vwqsd/)

## Participation in development
```
https://github.com/lastuniverse/msg-localize/issues
```
## License

MIT

[![NPM](https://nodei.co/npm/msg-localize.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/msg-localize/)

[npm-image]: https://img.shields.io/npm/v/msg-localize.svg?style=flat
[npm-url]: https://npmjs.org/package/msg-localize
[david-image]: http://img.shields.io/david/lastuniverse/msg-localize.svg?style=flat
[david-url]: https://david-dm.org/lastuniverse/msg-localize
[license-image]: http://img.shields.io/npm/l/msg-localize.svg?style=flat
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/msg-localize.svg?style=flat
[downloads-url]: https://npmjs.org/package/msg-localize
