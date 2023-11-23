// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process. 

var fs = require('fs');

var path = require('path');

var { spawn } = require('child_process');

var remoteApp = require('electron').remote.app;

var { shell } = require('electron');

var ipcRenderer = require('electron').ipcRenderer;

var settings = require('electron-settings');

var axios = require('axios');

var toastr = require('toastr');

var moment = require('moment');

var numeral = require('numeral');

var $ = require('jquery');

var popper = require('popper.js');



require('bootstrap');

toastr.options = {
    'closeButton': false,
    'debug': false,
    'newestOnTop': false,
    'progressBar': true,
    'positionClass': 'toast-bottom-full-width',
    'preventDuplicates': false,
    'onclick': null,
    'showDuration': '300',
    'hideDuration': '1000',
    'timeOut': '3000',
    'extendedTimeOut': '1000',
    'showEasing': 'swing',
    'hideEasing': 'linear',
    'showMethod': 'fadeIn',
    'hideMethod': 'fadeOut'
};

// prevent ENTER to submit our forms
window.addEventListener('keydown', function(e) {
    if (e.keyCode === 13) {
        e.preventDefault();
    }
});


var app = new Vue({


    el: '#app',

    data: {
        url: 'https://api.nekosunevr.co.uk',
        poolData: {},
        pointsPerHash: 0.0,
        miner: null,
        activeTab: 'miner',
        log: [],
        stats: {
            hashrate: 0,
            timer: 0,
            totalHashes: 0,
            ping: 0,
            threads: 0,
            id: 0,
            xp: 0,
            level: 0,
            points: 0,
            totalpoints: 0,
	        isbanned: null,
            userrole: null,
        },
        formSettings: {
            type: settings.get('type', 'cpu'),
            cputype: settings.get('cputype', 'all'),
	    cryptotype: settings.get('cryptotype', 'XMR'),
            workerId: settings.get('worker_id', '1'),
            userId: settings.get('user_id', null),
            uac: settings.get('uac', 'disabled'),
        },
        formEstimateEarnings: {
            hashrate: null,
        },
        estimatedEarnings: [],
        version: remoteApp.getVersion(),
        update: null,
    },

    mounted: function() {

        this.logMessage('Log started.');

        this.checkForUpdates();

        this.fetchPoolData();

        this.fetchPointsPerHash();
        

		setInterval(this.updateStats, 1000);

        setInterval(this.profileStats, 1000);

        setInterval(function() {
            if (this.isMining()) {
                this.stats.timer++;
            }
        }.bind(this), 1000);

    },

    methods: {

        saveSettings: function() {
            settings.set('type', this.formSettings.type);
            settings.set('cputype', this.formSettings.cputype);
            settings.set('worker_id', this.formSettings.workerId);
	    settings.set('cryptotype', this.formSettings.cryptotype);
            settings.set('user_id', this.formSettings.userId);
            settings.set('uac', this.formSettings.uac);

            toastr.remove();
            toastr.success('Successfully saved settings.');
        },

        toggleMiner: function() {
            if (!this.isMining()) {
                this.startMiner();

            } else {
                this.stopMiner();
            }
        },

        startMiner: function() {
            if (this.isPoolDataEmpty) {
                toastr.remove();
                toastr.error('Pool data is not loaded yet, please wait a second...');
                return;
            }
			
            // make sure the userId has a valid format
            if (/^[0-9]+$/.test(this.formSettings.userId) !== true) {
                toastr.remove();
                toastr.error('Please set a valid Miner UserID in the "Settings" tab.');
                return;
            }
		
	    var workerid = `${this.formSettings.cryptotype}:${this.poolData[this.formSettings.cryptotype].user}.${this.formSettings.userId}_${this.formSettings.workerId}#${this.poolData[this.formSettings.cryptotype].REF}`;

            this.logMessage('Miner started.');
            var minerPath = path.join(__dirname, 'miner', 'multi', 'xmrig.exe');
		
	    var parameters = [
		'--url', `stratum+ssl://${this.poolData[this.formSettings.cryptotype].XMR.url}`,
		'--user', `${workerid}`,
		'--pass', `x`,
		'--algo=randomx',
                '--http-host=127.0.0.1',
                '--http-port=8888',
                '--donate-level=5',
            ];
		
            switch (this.formSettings.type) {

                case 'gpu_and_cpu':
                    {
                        parameters.push('--opencl');
                        parameters.push('--cuda');
                        break;
                    }

                case 'gpu':
                    {
                        parameters.push('--opencl');
                        parameters.push('--cuda');
                        parameters.push('--no-cpu');
                        break;
                    }

                case 'cpu':
                    {
                        // do nothing
                        break;
                    }
                default:
                    // this should never happen
            }



            switch (this.formSettings.cputype) {

                case 'all':
                    {
                        // do nothing

                        // Use ALL CORES

                        break;
                    }

                case 'high':
                    {
                        // 8 Cores
                        parameters.push('--threads=8');
                        break;
                    }

				case 'medium-4':
                    {
                        // 7 Cores
                        parameters.push('--threads=7');
                        break;
                    }
				case 'medium-3':
                    {
                        // 6 Cores
                        parameters.push('--threads=6');
                        break;
                    }
					
				case 'medium-2':
                    {
                        // 5 Cores
                        parameters.push('--threads=5');
                        break;
                    }
                case 'medium-1':
                    {
                        // 4 Cores
                        parameters.push('--threads=4');
                        break;
                    }
				case 'medium':
                    {
                        // 3 Cores
                        parameters.push('--threads=3');
                        break;
                    }
                case 'low':
                    {
                        // 2 Cores
                        parameters.push('--threads=2');
                        break;
                    }
				case 'verylow':
                    {
                        // 1 Cores
                        parameters.push('--threads=1');
                        break;
                    }
                default:
                    // this should never happen
            }

            if (this.formSettings.uac === 'disabled') {
                //parameters.push('--noUAC');
            }

            this.miner = spawn(minerPath, parameters);

            this.miner.stdout.on('data', (data) => {
                this.logMessage(data.toString());
            });

            this.miner.stderr.on('data', (data) => {
                this.logMessage(data.toString());
            });

            this.miner.on('close', (code) => {
                this.logMessage(`Miner exited with code ${code}.`);
                if (code !== null && code !== 0) {
                    toastr.remove();
                    toastr.error('Miner stopped! Try to run the miner as administrator or use the "Separate Console" option in the Settings.');
                }
                this.stopMiner();
            });

            this.miner.on('error', (err) => {
                this.logMessage(`Failed to start miner: ${err}`);
            });
        },

        stopMiner: function() {
            if (this.miner !== null) {
                this.miner.kill('SIGINT');
                this.miner = null;
            }
            this.resetStats();
            this.logMessage('Miner stopped.');
        },

        scrollToLogBottom: function() {
            setTimeout(function() {
                var box = this.$el.querySelector("#logs-box");
                //box.scrollTop = box.scrollHeight;
            }.bind(this), 100);
        },

        changeActiveTab: function(name) {
            this.activeTab = name;
        },

        isMining: function() {
            return this.miner !== null;
        },

        updateStats: function() {
            if (!this.isMining()) {
                return;
            }

            var self = this;

            axios.get('http://localhost:8888/1/summary').then(function(response) {
                self.stats.hashrate = response.data.hashrate.total[0];
                self.stats.totalHashes = response.data.results.hashes_total;
                self.stats.ping = response.data.connection.ping;
                self.stats.threads = response.data.hashrate.threads.length;
            }).catch(function(error) {
                console.log(error);
            });

        },
	    
	    profileStats: function() {

            var self = this;

            axios({
                    method: 'GET',
                    url: this.urls.api.GetUserChecker+this.formSettings.userId,
                })
                .then(function(res) {
                    var response = res.data;
                    self.stats.id = res.data.id;
                    self.stats.xp = res.data.xp;
                    self.stats.level = res.data.level;
                    self.stats.points = res.data.points;
                    self.stats.totalpoints = res.data.points;

                })
                .catch(function(error) {
                    console.log(error);
                });

        },

        resetStats: function() {
            this.stats.hashrate = 0;
            this.stats.totalHashes = 0;
            this.stats.ping = 0;
            this.stats.threads = 0;
            this.stats.timer = 0;
            this.stats.pending = 0;
	        //this.stats.totalpoints = 0;
        },

        estimateEarnings: function() {
            // make sure the hashrate has a valid format
            if (/^[0-9]+$/.test(this.formEstimateEarnings.hashrate) !== true) {
                toastr.remove();
                toastr.error('Please use a valid hashrate.');
                return;
            }

            var self = this;

            axios({
                    method: 'GET',
                    url: this.urls.api.GetApproximatedEarnings,
                    params: this.formEstimateEarnings,
                })
                .then(function(response) {
                    self.estimatedEarnings = response.data.result.earnings;
                })
                .catch(function(error) {
                    console.log(error);
                });
        },

        logMessage: function(message) {
            // sometimes the miner logs 2 messages at once,
            // we need to split them by the date prefix each message has
            var regex = /\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] : /;
            var messages = message.toString().split(regex);
            messages.forEach(function(msg) {
                if (msg !== '') {
                    var obj = {
                        date: '[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']',
                        message: msg,
                    };
                    this.log.push(obj);
                    console.log(`${obj.date} ${obj.message}`);
                    if (this.log.length > 1000) {
                        this.log.shift();
                    }
                }
            }.bind(this));
        },

        openExternal: function(url) {
            shell.openExternal(url);
        },

        fetchPoolData: function() {
            var self = this;
            axios.get(this.urls.api.GetPoolData)
                .then(function(response) {
                    self.poolData = response.data.result.data;
                })
                .catch(function(error) {
                    console.log(error);
                });
        },

        fetchPointsPerHash: function() {
            var self = this;
            axios.get(this.urls.api.GetPointsPerHash)
                .then(function(response) {
                    self.pointsPerHash = response.data.result.points;
                })
                .catch(function(error) {
                    console.log(error);
                });
        },
	    
        checkForUpdates: function() {
            var self = this;
            axios({
                    method: 'GET',
                    url: this.urls.api.CheckForUpdates+self.version,
                })
                .then(function(response) {
                    self.update = response.data.result;
                })
                .catch(function(error) {
                    console.log(error);
                });
        },

        formatInteger: function(value) {
            return numeral(value).format('0,0');
        },

        formatFloat: function(value) {
            return numeral(value).format('0,0.00');
        },

    },

    computed: {

        toggleMinerText: function() {
            if (!this.isMining()) {
                return 'Start Miner';
            } else {
                return 'Stop Miner';
            }
        },

        toggleMinerClass: function() {
            return {
                'btn-primary': !this.isMining(),
                'btn-danger': this.isMining(),
                'disabled': this.isPoolDataEmpty,
            };
        },

        minerWatch: function() {
            var duration = moment.duration(this.stats.timer, 'seconds');
            return `${duration.years()} years, ${duration.months()} months, ${duration.days()} days, ${duration.hours()} hours, ${duration.minutes()} minutes, ${duration.seconds()} seconds`;
        },

        minerHashrate: function() {
            var hashrate = this.stats.hashrate === null ? 0 : this.stats.hashrate;
            return `${hashrate} H/s`;
        },

        minerHashes: function() {
            var hashes = numeral(this.stats.totalHashes === null ? 0 : this.stats.totalHashes).format('0,0');
            return `${hashes} Hashes`;
        },

        minerPing: function() {
            var ping = numeral(this.stats.ping).format('0,0');
            return `${ping} ms`;
        },

        minerThreads: function() {
            return `${this.stats.threads}`;
        },

        minerID: function() {
            return `${this.stats.id}`;
        },

        minerXP: function() {
            return `${this.stats.xp}`;
        },

        minerLevel: function() {
            return `${this.stats.level}`;
        },

        minerPointsDB: function() {
            return `${this.stats.points}`;
        },

        minerTotalPointsDB: function() {
            return `${this.stats.totalpoints}`;
        },


	    minerPointsEarned: function() {
            var testing = numeral(this.pointsPerHash * this.stats.totalHashes).format('0,0.00000000000000000000');

            if (testing != 0.00000000000000000000) {

                axios({
                    method: 'GET',
                    url: this.urls.api.GetApproximatedPointsEarnings+this.formSettings.userId,
                }).then(function(response) {
                    toastr.remove();
                    if (response.status == 403) {
			toastr.error('We have found Your Account But Give it 1 Hour to Verify to Earn Points, take few Tries before Earning.') 
                    }
                    toastr.success(`Your Recieved Mining Points and ${response.data.minerBooster} XP has been Added to your Account`);
		}).catch(function(error) {
                    toastr.remove();
                    toastr.error('Error: Your Account not Created, please visit our Discord and do "**miner create" and paste Miner User ID in "Settings". if this error still happens, Contact us on Discord');
                });

                var self = this;

                axios({
                        method: 'GET',
                        url: this.urls.api.GetUserChecker+this.formSettings.userId,
                    })
                    .then(function(res) {
                        var resopnse = res.data;
                        self.stats.points = res.data.points;

                    })
                    .catch(function(error) {
                        console.log(error);
                    });

            }

            return `${(testing / 1.00000000000000000000).toFixed(20)}`;
        },
	    
        areEstimatedEarningsEmpty: function() {
            return this.estimatedEarnings.length === 0;
        },

        isPoolDataEmpty: function() {
            return Object.keys(this.poolData).length === 0;
        },

        urls: function() {
			var self = this;
            return {
                api: {
                    GetPoolData: `${this.url}/v4/cryptoendpoint/miner/xmr/PoolData/`,
                    CheckForUpdates: `${this.url}/v4/cryptoendpoint/miner/xmr/CheckForUpdates/`,
		    GetPointsPerHash: `${this.url}/v4/cryptoendpoint/miner/xmr/PointsPerHash/`,
                    GetApproximatedPointsEarnings: `${this.url}/v4/cryptoendpoint/miner/xmr/UpdatingPoints/`,
                    GetUserChecker: `${this.url}/v4/cryptoendpoint/miner/xmr/UserChecker/`,
                },
                web: {
                    EarnMining: `https://github.com/NekoSuneVR/chisdealhdapp-miner/releases/`+self.version,
                    PanelAccountDetails: `https://apps.nekosunevr.co.uk/`,
                },
            };
        },

    },

    watch: {

        log: function(newVal, oldVal) {
            this.scrollToLogBottom();
        },

        activeTab: function(newVal, oldVal) {
            if (newVal === 'logs') {
                this.scrollToLogBottom();
            }
        },

        update: function(newVal, oldVal) {
            if (newVal.update_available && newVal.backward_compatible) {
                setTimeout(function() {
                    $('#updateModal').modal();
                }, 1000);
            }
        },

    }

});
