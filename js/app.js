import 'regenerator-runtime/runtime'
import { gsap, Power1, Power4, Power3 } from 'gsap';
import Stats from 'three/examples/jsm/libs/stats.module';
import WebaWorld from './WebaWorld';
import userAgent from './userAgent';
import UI from './UI';
import ContentManager from './ContentManager';

let world;
let windowWidth;
let windowHeight;
let foreground;
let foregroundImg;
let parallaxAmount = 80;
let guiParams;
let isMobile;
let contentContainer;
let stats;
let showStats = false;
let navGrad;
let nav = document.querySelector('.nav');
let originalContentHeight = null;
//import "./css/index.css";

// console.log = function(){};


window.onload = init;

function init(){
    console.log( 'app.init');

    if( showStats ) stats = new Stats();
    
    isMobile = userAgent.getUserAgent();
    console.log( 'isMobile ' + isMobile );
    
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    
    WebaWorld.dispatcher.once( 'modelLoaded', function() { 
        console.log( 'app.modelLoaded()' )
        document.querySelector( '.content-container' ).style.display = 'block';
        
        gsap.set( nav, { y: 10 } );
        gsap.to( nav, 0.6, { y: 0, opacity: 1, ease: Power3.easeOut, delay: 2 } );
        WebaWorld.getAudioManager().dispatcher.addEventListener( 'audioInitByInteraction', UI.toggleAudioIconOn )

    } )

    WebaWorld.dispatcher.addEventListener( 'audioInitMobile', UI.forceComplete );

       
    UI.dispatcher.addEventListener( 'toggleAudio', function( e ){
        console.log( 'toggleAudio');
        if( e.audioToggle ) {
            WebaWorld.getAudioManager().playAll();

        } else {
            WebaWorld.getAudioManager().stopAll();
        }

    });


    UI.init( { isMobile: isMobile } );

    contentContainer = document.querySelector( '.content-container' );

    ContentManager.init( { 
        isMobile: isMobile,
        container: contentContainer,
    })

    WebaWorld.init( { 
        modelPath: "./assets/models/homespace/homespace_shell_V12_galad.glb",
        modelPos: { x: -2, y: -0.5, z: 0 },
        modelScale: 8.0,
        modelRotationAngles: { x: 17, y: 48.5, z: 0 },
        width: windowWidth, 
        height: windowHeight,
        fov: 45, 
        near: 1,
        far: 10000,
        fogNear: 0.1,
        fogFar: 100,
        fogColor: 0xffffff,
        fogDensity: 0.00007,
        fogSpeed: 0.001,
        cameraPos: { x: 0, y: 200, z: 500 },
        sunlightColor: 0xdbdf66,
        sunlightIntensity: 3.5,
        sunlightPos: { x: -20, y: 20, z: 10 },
        sunlightShadowMapSize: 5,
        wireframe: false, 
        colors: { fog: 0x222222, top: 0x222222, bot: 0x04FFFF },
        cloudRotationSpeed: 0.0002,
        isMobile: isMobile,
        container: document.querySelector( '.app-container' ),
    } );

    navGrad = document.querySelector( '.nav-grad' );

    if( showStats ) document.body.appendChild( stats.dom );

    var width = document.body.offsetWidth;
    var height = document.body.offsetHeight;

    window.addEventListener("scroll", updateScroll );

    window.addEventListener( 'resize', ()=>{
            resize();
    }, false );

    window.addEventListener( 'orientationchange', ()=>{
        resize();
    }, false );

    if( isMobile ){
        window.addEventListener('touchstart', WebaWorld.touchMove, false );
        window.addEventListener( 'touchmove', WebaWorld.touchMove, false )
    } else {
        window.addEventListener( 'mousemove', WebaWorld.mouseMove, false );
    }
    
    resize();
    update();
}

const update = () => {
    requestAnimationFrame( ( t ) => {
        WebaWorld.update( t );
        UI.update();
        if( showStats ) stats.update();
        update();
    } );
};

const updateScroll = ( e ) => {
    // return;
    var yVal = window.scrollY / window.innerHeight;
    //gsap.set( contentContainer, { y: -( yVal * ( window.innerHeight * 0.25 ) ) })
    WebaWorld.updateCameraPosition( yVal * 1.5 );
    ContentManager.updateScroll( yVal );
    let gradVal = Math.min( yVal * 10, 1 );
    navGrad.style.opacity = gradVal;

    nav.style.opacity = 0;


    if(window.scrollY > 0){

        nav.style.opacity = 0;
    }
    if (document.documentElement.scrollHeight === window.innerHeight + window.scrollY){
        nav.style.opacity = 1;
    }
    if (window.scrollY < 50){

        nav.style.opacity = 1;
    }
}

const resize = () => {

    windowWidth = document.documentElement.clientWidth;
    windowHeight = document.documentElement.clientHeight;
    if(window.innerWidth < 600){
        document.querySelector( '.content-container' ).style.height = 'auto';        
    }
    else{
        document.querySelector( '.content-container' ).style.height = '0px';
        setTimeout(() => {
            document.querySelector( '.content-container' ).style.height = (document.body.scrollHeight - window.innerHeight)+ "px"
        }, 500);
    }
    WebaWorld.resize( windowWidth, windowHeight );
    ContentManager.resize( windowWidth, windowHeight );

}

