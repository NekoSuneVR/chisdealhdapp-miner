lolMiner 1.53

For a short introduction how to mine using lolMiner, see
https://github.com/Lolliedieb/lolMiner-releases/wiki

Also have a look to the mine_coin.bat or mine_coin.sh files which can be used as 
starting point to run lolMiner on the command line.

Here is a list of the most relevant parameters for lolMiner:

General:
  -h [ --help ]                         Help screen
  --config arg (=./lolMiner.cfg)        Config file
  --json arg (=./user_config.json)      Config file in Json format
  --profile arg                         Profile to load from Json file
  --nocolor [=arg(=on)] (=off)          Disable colors in output
  --basecolor [=arg(=on)] (=off)        Use 16 colors scheme for non-rgb 
                                        terminals
  --list-coins                          List all supported coin profiles
  --list-algos                          List all supported algorithms
  --list-devices                        List all supported & detected GPUs in 
                                        your system
  -v [ --version ]                      Print lolMiner version number

Mining:
  -c [ --coin ] arg                     The coin to mine
  -a [ --algo ] arg                     The algorithm to mine. 
                                        This is an alternative to --coin. 
  -p [ --pool ] arg                     Mining pool to mine on
                                        Format: <pool>:<port>
  -u [ --user ] arg                     Wallet or pool user account to mine on
  --pass arg                            Pool user account password (Optional)
  --tls arg                             Toggle TLS ("on" / "off")
  --socks5 arg (=nosocks)               Specifies for a Socks 5 based proxy 
                                        server. Format <ip>:<port>.
  --dns-over-https arg (=1)             Toggle dns over https. 
                                        0=default dns only
                                        1=DoH with default dns as backup 
                                        (default)
                                        2=DNS over https enforced
  --devices arg                         The devices to mine on 
                                        Values: ALL / AMD / NVIDIA or a comma 
                                        separated list of indexces.
  --devicesbypcie [=arg(=on)] (=off)    Interpret --devices as list of PCIE 
                                        BUS:SLOT pair
  --pers arg                            The personalization string. 
                                        Required when using --algo for Equihash
                                        algorithms
  --keepfree arg (=5)                   Set the number of MBytes of GPU memory 
                                        that should be left free by the miner.
  --benchmark arg                       The algorithm to benchmark

Managing Options:
  --watchdog arg (=script)              Specify which action to take when a 
                                        card is detected to be crashed.
                                        "off": Continue working on remaining 
                                        cards. No action.
                                        "exit": Exit the miner with exit code 
                                        42 to ask for a restart. Recommended 
                                        for Nvidia cards.
                                        "script": Call an external script. 
                                        Default and recommended for AMD cards.
  --watchdogscript arg                  Specify which script to be executed 
                                        when a hung GPU is detected
  --singlethread [=arg(=-1)] (=-2)      Enable single mining thread mode for 
                                        all GPUs (-1) or for a specific GPU id.
  --tstart arg (=0)                     Minimal temperature for a GPU to start 
                                        in degree C. If set to 0 disables 
                                        restart below a fixed temperature.
  --tstop arg (=0)                      Temperature to pause or stop a GPU from
                                        mining in degree C. If set to 0 
                                        disables stop above a fixed 
                                        temperature.
  --tmode arg (=edge)                   Mode for temperature management.
                                        Use "edge" (default), "junction" or 
                                        "memory" to set the mode for 
                                        temperature management.

Statistics:
  --apiport arg (=0)                    The port the API will use
  --apihost arg (=0.0.0.0)              The host binding the API will use
  --longstats arg (=60)                 Long statistics interval
  --shortstats arg (=15)                Short statistics interval
  --statsformat arg (=extended)         Format for long statistics.
                                        Use --help-format to get an overview of
                                        available fields.
  --hstats [=arg(=0)] (=0)              Select stats to be drawn in a 
                                        horizontal manner for each GPU 
                                        (default). The number overwrites the 
                                        terminal width detection.
  --vstats [=arg(=0)] (=-1)             Select stats to be drawn in a vertical 
                                        manner for each GPU. The number 
                                        overwrites the terminal width 
                                        detection.
  --help-format [=arg(=1)]              Format description for --statsformat
                                        
  --digits arg                          Number of digits in hash speed after 
                                        delimiter
  --timeprint [=arg(=on)] (=off)        Enables time stamp on short statistics 
                                        ("on" / "off")
  --silence arg (=0)                    Triggers different levels of miner 
                                        verbosity. 0 = normal information, 3 = 
                                        minimal information.
  --compactaccept [=arg(=on)] (=off)    Enables compact accept notification
  --log [=arg(=on)]                     Enables printing a log file ("on" / 
                                        "off")
  --logfile arg                         Path to a custom log file location

Overclock (Experimental):
  --cclk arg (=*)                       The core clock used for the GPUs. Cards
                                        are separated with a comma. "*" can be 
                                        used to skip a card.
                                        
  --mclk arg (=*)                       The memory clock used for the GPUs. 
                                        Cards are separated with a comma. "*" 
                                        can be used to skip a card.
                                        

Ethash Options:
  --ethstratum arg (=ETHPROXY)          Ethash stratum mode. Available options:
                                        ETHV1: EthereumStratum/1.0.0 (Nicehash)
                                        ETHPROXY: Ethereum Proxy
  --worker arg (=eth1.0)                Separate worker name for Ethereum Proxy
                                        stratum mode.
  --mode arg (=b)                       Kernel mode to mine on. Comma separated
                                        values for configuring multiple cards 
                                        differently.
  --lhrtune arg (=auto)                 Offset to most important LHR 
                                        parameters. If your card is unstable or
                                        does not unlock try negative values. 
                                        Range is +/-40.
  --lhrwait arg (=0)                    Time in seconds to wait after startup 
                                        before any LHR detection or calibration
                                        takes place.
  --lhrv3boost [=arg(=0)] (=1)          Activating experimental >90% unlock on 
                                        LHR V3 (RTX 3050, 3080 12G) GPUS.
  --disable-dag-verify [=arg(=1)] (=0)  Disable the CPU side verification and 
                                        repair of DAG.
  --dagdelay [=arg(=0)] (=-1)           Delay between creating the DAG buffers 
                                        for the GPUs. Negative values enable 
                                        parallel generation (default).
  --enablezilcache [=arg(=1)] (=0)      Allows 8G+ GPUs to store the DAG for 
                                        mining Zilliqa. It will generated only 
                                        once and offers a faster switching.
  --benchepoch arg (=440)               The DAG epoch the denchmark mode will 
                                        use

Altcoin Options:
  --ergo-prebuild arg (=-1)             Disable (0) or Enable (1) the function 
                                        of pre-building the dataset for Ergo. 
                                        -1 refers to the card default.
  --ton-mode arg (=0)                   Sets the ton pool commication mode.
                                          0: automatic selection(default)
                                          1: ton-miner compatible
                                          2: ton-pool.com websocket
                                          3: toncoinpool.io stratum
                                          4: tonuniverse.com compatible

Ethash Expert Options:
  --workmulti arg (=192)                Modifys the amount of Ethash work a GPU
                                        does per batch.
  --rebuild-defect arg (=3)             Triggers a DAG rebuild if a card 
                                        produced <param> defect shares. Default
                                        is 3, use 0 to deactivate the rebuild.
  --enable-ecip1099 [=arg(=on)] (=off)  Enable reduced DAG size for mining ETC 
                                        from block 11.730.000 and higher.

Algorith Split Options:
  --dualmode arg (=none)                Dual mode used. Allowed options:
                                        none, zil, zilEx, eth, etc
  --dualpool arg                        Pool configuration for extra 
                                        connection, Format <pool>:<port>
  --dualuser arg                        Username or wallet address for the 
                                        extra connection
  --dualpass arg                        Password for the extra connection 
                                        (Optional)
  --dualworker arg (=eth1.0)            Separate worker name for the 2nd 
                                        connection.
  --dualtls arg                         Toggle TLS ("on" / "off") for the 2nd 
                                        connection.
  --dualdevices arg                     Split rule for etc and beam split mode.
                                        Use a comma separated list of indexes 
                                        or "4G" (default).
  --dualfactor arg (=auto)              The ratio in mining speed between the 
                                        primary and the secondary algorithm in 
                                        dual mining. Alternative to 
                                        --maxdualimpact.
  --maxdualimpact arg (=auto)           The maximum impact on the eth mining 
                                        speed in dual mining in %. Default is *
                                        for an automatic mode. Can be a comma 
                                        separated list for different GPUs.




