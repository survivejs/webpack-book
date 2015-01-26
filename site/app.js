'use strict';

require('purecss/pure.css');
require('../css/style.css');

var recipes = require('./output.json');

var React = require('react');


var App = React.createClass({
    render() {
        console.log('json', recipes);

        return <div className='pure-g'>
            <a href='https://github.com/christianalfoni/react-webpack-cookbook'>
                <img
                    className='github-fork'
                    src='https://camo.githubusercontent.com/38ef81f8aca64bb9a64448d0d70f1308ef5341ab/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f6461726b626c75655f3132313632312e706e67'
                    alt='Fork me on GitHub'
                    data-canonical-src='https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png'></img>
            </a>
            <header className='pure-u-1'>
                <h1>React Webpack cookbook</h1>

                <div className='description'>Learn to use React.js with Webpack</div>
            </header>
            <article className='pure-u-1'>{
                recipes.map((recipe, i) =>
                    <div className='recipe' key={'recipe-' + i}>
                        <h2>{recipe.title}</h2>
                        <div dangerouslySetInnerHTML={{__html: recipe.content}}></div>
                    </div>
                )
            }</article>
        </div>;
    },
});

module.exports = App;
