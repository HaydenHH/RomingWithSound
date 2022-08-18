

//自定义DOM覆盖物 - 继承DOMOverlay
function myInfoWindow(options) {
    var mydom;
    TMap.DOMOverlay.call(this, options);
}
myInfoWindow.prototype = new TMap.DOMOverlay();

// 初始化
myInfoWindow.prototype.onInit = function (options) {
    this.position = options.position;
    this.content = options.content;
};

// 创建DOM元素，返回一个DOMElement
myInfoWindow.prototype.createDOM = function () {

    const mydom = document.createElement('img')
    mydom.src = './img/location.svg'
    mydom.style.width = '42px'
    // mydom.append(img)

    // mydom.innerHTML=this.content;
    mydom.addEventListener("click", () => {
        getPath(this.position, this.map)


    })

    return mydom;
};

// 更新DOM元素，在地图移动/缩放后执行
myInfoWindow.prototype.updateDOM = function () {
    if (!this.map) {
        return;
    }

    // 经纬度坐标转容器像素坐标
    let pixel = this.map.projectToContainer(this.position);

    //默认使用DOM左上角作为坐标焦点进行绘制（左上对齐）
    //如想以DOM中心点（横向&垂直居中）或其它位置为焦点，可结合this.dom.clientWidth和this.dom.clientHeight自行计算
    let left = pixel.getX() - this.dom.clientWidth / 2 + 'px'; //本例水平居中
    let top = pixel.getY() + 'px';

    //将平面坐标转为三维空间坐标
    this.dom.style.transform = `translate3d(${left}, ${top}, 0px)`;
};

myInfoWindow.prototype.remove = function () {
    this.dom.remove()
}

function drawPath(path, map) {
    console.log('这个地图', map);
    // polylineLayer && polylineLayer.remove()
    console.log('图层', this.polylineLayer);
    if (this.polylineLayer) this.polylineLayer.setMap(null)
    this.polylineLayer = new TMap.MultiPolyline({
        id: 'polyline-layer', //图层唯一标识
        map: map,//设置折线图层显示到哪个地图实例中
        //折线样式定义
        styles: {
            'style_blue': new TMap.PolylineStyle({
                'color': '#e08e65', //线填充色
                'width': 8, //折线宽度
                'borderWidth': 3, //边线宽度
                'borderColor': '#FFF', //边线颜色
                'lineCap': 'butt' //线端头方式
            }),
            'style_red': new TMap.PolylineStyle({
                'color': '#CC0000', //线填充色
                'width': 6, //折线宽度
                'borderWidth': 5, //边线宽度
                'borderColor': '#CCC', //边线颜色
                'lineCap': 'round' //线端头方式
            })
        },
        //折线数据定义
        geometries: [
            {//第1条线
                'id': 'pl_1',//折线唯一标识，删除时使用
                'styleId': 'style_blue',//绑定样式名
                // 'paths': [new TMap.LatLng(40.038540, 116.272389), new TMap.LatLng(40.038844, 116.275210), new TMap.LatLng(40.041407, 116.274738)]
                'paths': path
            }
        ]
    });

    return this.polylineLayer


}

function getPath(pos, map) {
    // const key = 'CFUBZ-CZA3I-XUXGF-5BRY4-EU33F-V2BJT'
    const key = 'CFUBZ-CZA3I-XUXGF-5BRY4-EU33F-V2BJT'
    const from = '23.125219,113.25583'
    const to = String(pos.lat + ',' + pos.lng)
    console.log('GO TO ', to);
    const url = `https://apis.map.qq.com/ws/direction/v1/walking/?from=${from}&to=${to}&key=${key}&output=jsonp`
    // console.log(url);
    // this.markEnd && this.markEnd.remove()
    // this.markEnd = new myInfoWindow({map:map,position:new TMap.LatLng(pos.lat,pos.lng),content:''})

    fetchJsonp(url).then(res => {

        return res.json()
    }).then((resjson, rej) => {
        console.log(resjson);
        if (resjson.status == 374) return
        this.routes = resjson?.result?.routes[0]?.steps
        this.stepsPos = resjson.result?.routes[0]?.polyline
        this.activeStep = -1
        var coors = resjson.result?.routes[0]?.polyline, pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩，因此需要解压）
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
            coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标生成LatLng数组
        for (var i = 0; i < coors.length; i += 2) {
            pl.push(new TMap.LatLng(coors[i], coors[i + 1]));
        }
        console.log('path is', pl);
        this.drawPath(pl, map)//显示路线

    })
}

class SoundIcon {
    constructor() {
        this.dom = document.createElement('img')
        this.dom.src = './img/soundIcon.png'
        this.dom.className = 'sound-icon'
        this.dom.style.left = Math.random() * window.innerWidth + 'px'
        document.querySelector('#container').appendChild(this.dom)
        this.dom.addEventListener('click', () => {
            Math.random() > 0.5 ? document.querySelector('#page2').classList.toggle('show') : document.querySelector('#page3').classList.toggle('show')
        })

    }
    go() {
        // console.log('元素走了');
        // this.ani?.kill()
        // console.log(this.ani);
        if (this.ani) {
            gsap.set(this.dom, { y: -100 })
            this.ani.restart()
        }
        this.ani = gsap.to(this.dom, {
            duration: 20,
            delay: Math.random() * 3,
            y: window.innerHeight * Math.random() + window.innerHeight,
            x: window.innerWidth * Math.random() - window.innerWidth / 2,
            onComplete: () => {
                console.log('oks');
                gsap.set(this.dom, { y: -100 })
            }
        })
        // console.log(this.ani);
    }
}
class SoundRain {

    constructor() {
        this.sounds = []
        for (let i = 0; i < 10; i++) {
            this.sounds.push(new SoundIcon())
        }

    }
    update() {
        this.sounds.forEach(ele => {
            ele.go()
        })
    }
}
let rain
function initMap() {
    rain = new SoundRain()
    //定义地图中心点坐标
    var center = new TMap.LatLng(23.125219, 113.25583)
    //定义map变量，调用 TMap.Map() 构造函数创建地图

    this.map = new TMap.Map(document.querySelector('#container'), {
        center: center,//设置地图中心点坐标
        zoom: 17.2,   //设置地图缩放级别
        pitch: 0,  //设置俯仰角
        rotation: 0,   //设置地图旋转角度
        viewMode: '2D',
        mapStyleId: "style1",
        baseMap: {			//底图设置（参数为：VectorBaseMap对象）
            type: 'vector',	//类型：失量底图
            features: ['base', 'building2d']
            //仅渲染：道路及底面(base) + 2d建筑物(building2d)，以达到隐藏文字的效果
        },
        showControl: false
    })





    //创建一个自定义的infoWindow
    var myIW = new myInfoWindow({
        map: this.map,
        position: center,
        content: "Hello world!"
    })

    const pos1 = new myInfoWindow({
        map: this.map,
        position: new TMap.LatLng(23.115423, 113.238235)
    })
    const pos2 = new myInfoWindow({
        map: this.map,
        position: new TMap.LatLng(39.790166, 116.304448)
    })
    const pos3 = new myInfoWindow({
        map: this.map,
        position: new TMap.LatLng(23.12705, 113.24693)
    })
    const pos4 = new myInfoWindow({
        map: this.map,
        position: new TMap.LatLng(23.121297, 113.231472)
    })
    const pos5 = new myInfoWindow({
        map: this.map,
        position: new TMap.LatLng(23.13286, 113.264692)
    })
    const pos6 = new myInfoWindow({
        map: this.map,
        position: new TMap.LatLng(23.140096, 113.265561)
    })
    const pos7 = new myInfoWindow({
        map: this.map,
        position: new TMap.LatLng(23.120939, 113.267678)
    })



    this.map.addListener('click', e => {
        console.log(e);
        this.getPath(e.latLng, this.map)
        // this.map.panTo(e.latLng,{duration:3000})
        rain.update()
    })




}



const { createApp, ref, reactive } = Vue
const App = createApp({
    setup() {
        const input = ref(null)
    },
    data() {
        return {
            page3Show: false,
            message: 'Hello Vue!',
            map: null,
            rain: null,
            // polylineLayer:null,
            markEnd: null,
            routes: [],
            stepsPos: [],
            activeStep: -1,
            audios: [],
            activeAudio: -1,
            audioProgress: 0,
            direction: ''
        }
    },
    methods: {
        initMap: initMap,
        getPath: getPath,
        drawPath: drawPath,
        showPage2: function () {
            document.querySelector('#page2').classList.add('show')
        },
        closePage2: function () {
            document.querySelector('#page2').classList.toggle('show')
        },
        closePage3: function () {
            document.querySelector('#page3').classList.toggle('show')
        },
        nextStep: function () {
            (this.routes.length > 0 && this.activeStep < this.routes.length - 1) && this.activeStep++

            const index = this.routes[this.activeStep].polyline_idx[0]


            const pos = new TMap.LatLng(this.stepsPos[index], this.stepsPos[index + 1])
            this.direction = this.routes[this.activeStep].dir_desc
            this.map.panTo(pos, { duration: 3000 })
            this.rain?.update()

            this.changeSoundDir()

        },
        previousStep: function () {
            this.activeStep > 0 && this.activeStep--
            const index = this.routes[this.activeStep].polyline_idx[0]

            const pos = new TMap.LatLng(this.stepsPos[index], this.stepsPos[index + 1])
            this.direction = this.routes[this.activeStep].dir_desc
            this.map.panTo(pos, { duration: 3000 })
        },
        playAudio: function () {
            const audio = this.audios[Math.random()>0.5?0:1]
            !audio.playing() && audio?.play()
        },
        changeAudio: function () {
            this.audios[this.activeAudio]?.seek(this.audioProgress)
        },
        changeSoundDir: function () {
            console.log(this.direction);
            let sound = 0
            switch (this.direction) {
                case '东':
                    sound = 0.7
                    break
                case '南':
                    sound = 0
                    break
                case '西':
                    sound = -0.7
                    break
                case '北':
                    sound = 0
                    break
                case '东北':
                case '东南':
                    sound = 0.35
                    break

                case '西北':
                case '西南':
                    sound = -0.35
                    break

            }
            console.log(sound);
            const activeAudio = this.audios[this.activeAudio]
            if (activeAudio) activeAudio.stereo(sound)
            // activeAudio.pause()
            // activeAudio.play()
        }
    },
    mounted() {

        this.initMap()
        const audio1 = new Howl({
            src: ['短录音.mp3']
        });
        const audio2 = new Howl({
            src: ['长录音.mp3']
        });
        this.audios.push(audio1,audio2)
        this.activeAudio = 0

        setInterval(() => {
            const activeAudio = this.audios[this.activeAudio]
            if (activeAudio.playing()) {

                this.audioProgress = activeAudio.seek()
            }
        }, 500)
    }
})


window.onload = () => {
    App.mount('#app')
}