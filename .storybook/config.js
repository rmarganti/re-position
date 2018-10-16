import { configure } from "@storybook/react";
import { setAddon} from "@storybook/react";
import JSXAddon from "storybook-addon-jsx";
setAddon(JSXAddon);

// automatically import all files ending in *.stories.js
const req = require.context("../src", true, /.stories.js$/);
function loadStories() {
    require("./welcomeStory");
    req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
