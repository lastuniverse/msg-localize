const fs = require('fs');
const path = require('path');
const HJSON = require('hjson');

// Cache of already loaded files. If you try to reload a previously
// downloaded file, the data will be taken from this cache
const jsonFiles = {};

/**
 * loads all *.json and *.hjson files located in the specified directory
 * @param {String} dataPath - directory with *.json and *.hjson files
 * @return {Object} - an object in which the keys are filenames without
 *                    extension and the values ​​are parsed json or
 *                    hjson data
 */
function loadHJsonFiles(dataPath) {
    if (!fs.existsSync(dataPath))
        throw new Error(`Каталога ${dataPath} не существует`);

    const list = {};

    fs.readdirSync(dataPath).forEach(fileName => {
        if (!fileName.match(/\.h?json$/))
            return;

        const filePath = path.join(__dirname, dataPath, fileName);
        const key = fileName.replace(/\.[^\.]*$/, '');

        if (jsonFiles[filePath]) {
            list[key] = jsonFiles[filePath];
        } else {
            const content = fs.readFileSync(filePath, "utf8");
            jsonFiles[filePath] = list[key] = HJSON.parse(content);
        }

    });
    return list;
}

/**
 * Returns a value from an object using "deep key". For example, 
 * if an object is given `obj = {foo: {bar: ["a", "b", "c"]}}`
 * then `getKey("foo.bar.1", obj)` will return "b"
 * then `getKey("foo.bar.*", obj)` will return random "a"|"b"|"c"
 * @param  {[type]} key  - "deep key" as "foo.bar"
 * @param  {[type]} keys - an object of type {foo: {bar: ["a", "b", "c"]}} or similar
 * @return {[type]} - the value in the object by the specified key
 */
function getKey(key, obj) {
    if (typeof obj !== "object")
        throw new TypeError(`keys is not defined in getKey("${key}", ${obj})`);


    if (typeof key === "string")
        key = key.split(/\./);
    const current = key.shift();

    let item = obj[current];
    if(current==="*"){
        if(Array.isArray(obj))
            obj=Object.values(obj);

        item = obj[Math.floor(Math.random()*obj.length)];
    }

    if (key.length)
        return getKey(key, item);

    return item;
}

/**
 * this class provides a simple way to localize your bot or 
 * application. Such as:
 * - loading localization data when creating an object from 
 *   this class
 * - receiving messages localized for each specific user
 * - the ability to substitute passed values ​​into templates 
 *   like $ {foo.bar}
 * - possibility of random selection of messages thanks to keys 
 *   like "foo.bar. *" "foo. *. bar"
 * - and much more
 */
class Messages {
    constructor(dataPath, locale) {
        this.steDafaultLocale(locale);
        this.messages = loadHJsonFiles(dataPath);
        this.recursionFind = {};
    }
    /**
     * sets the default locale
     * @param {String} locale 
     */
    steDafaultLocale(locale = "en_US") {
        this.locale = locale;
    }

    /**
     * returns a message corresponding to the deep key for the requested localization
     * @param {String} deepkey "deep key". For example, if an object is 
     *                         given `obj = {foo: {bar: ["a", "b", "c"]}}`
     *                         "foo.bar.1" return "b"
     *                         "foo.bar.*" return random "a"|"b"|"c"
     * @param {Object} data    Object with early substitutions for constructs like $ {foo} or $ {foo.bar}
     * @param {String} locale  language tag like "en_US"
     * @return {String} - message corresponding to the deep key for the requested localization
     */
    getMessage(deepkey, data={}, locale = this.locale) {
        if(typeof data === "string"){
            locale = data;
            data = {};
        }
        
        const text = this.__parseRawText(deepkey, data);
        console.log(text);
        this.recursionFind={};
        return text;
    }

    __getRawMessage(key, locale = this.locale) {
        let source = this.messages[locale]||this.messages[this.locale]||this.messages[Object.keys(this.messages)[0]]||{};
        let rawText = getKey(key, source);
        if (Array.isArray(rawText))
            return rawText
                .filter(value => (['string', 'number'].includes(typeof value)))
                .join(' ');

        return rawText;
    }

    __parseRawText(key, data={}, locale = this.locale){
        this.recursionFind[key]=true;
        const rawText = this.__getRawMessage(key, locale);        
        return rawText.replace(/\$\{\s*([^\{\}\s]*?)\s*\}/g, (tmp,key) =>{
            const value = getKey(key, data);
            return value.replace(/\$\{\s*([^\{\}\s]*?)\s*\}/g, (tmp,subkey) =>{
                if(this.recursionFind[subkey]) return `    !!!! FIND RECURSION FOR DEEPKEY: ${subkey}!!!!    `;
                this.recursionFind[subkey]=true;
                return this.__parseRawText(subkey, data, locale);
            });
        });
    }
}
module.exports = Messages;
