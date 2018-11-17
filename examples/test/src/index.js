import {jst} from 'jayesstee';
import {App} from './app.js';

let app = new App();

// Place the App in the body of the HTML doc
jst("body").appendChild(app);