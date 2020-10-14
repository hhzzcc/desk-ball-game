import { Desk } from './js/desk.js';

const scene = document.querySelector('.scene');
const cover = document.querySelector('.cover');

const desk = new Desk();
desk.init({
    scene,
    cover
});