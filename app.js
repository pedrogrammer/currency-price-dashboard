function app(value) {
    function sideBarMenu() {
        var friesMenu = $('#fries-menu'),
            sidebarMenu = $('#sidebar-menu'),
            dropShadow = $('#drop-shadow');
        function sideBarMenuDisplayHandler(val, e) {
            e.preventDefault();
            if (val === 'show') {
                dropShadow.show();
            } else if (val === 'hide') {
                dropShadow.hide();
            }
            sidebarMenu.css({
                right: `${val === 'show' ? '0' : '-50%'}`,
            });
        }

        friesMenu.click(function (e) {
            sideBarMenuDisplayHandler('show', e);
        });

        dropShadow.click(function (e) {
            sideBarMenuDisplayHandler('hide', e);
        });

        $('.dates').click(function (e) {
            sideBarMenuDisplayHandler('hide', e);
        });
    }

    function desiredDayPrice() {
        var year = $('.year'),
            months1400 = $('.1400.months'),
            months1401 = $('.1401.months'),
            monthsNames = [
                'فروردین',
                'اردیبهشت',
                'خرداد',
                'تیر',
                'مرداد',
                'شهریور',
                'مهر',
                'آبان',
                'آذر',
                'دی',
                'بهمن',
                'اسفند',
            ];
        window.addDaysHandler = function (year, month) {
            var day = `<li class="dates">${year}-${month + 1}-1</li>`;

            for (let i = 2; i <= 31; i++) {
                day += `<li class="dates">${year}-${month + 1}-${i}</li>`;
            }

            return day;
        };

        for (let i = 0; i < monthsNames.length; i++) {
            months1400.append(`
                <li>
                    <span class="plus-list-style-bullet">+</span>
                    <span class="minus-list-style-bullet none">-</span>
                    <span class="month">${monthsNames[i]}</span>
                    <ul class="days">${addDaysHandler('1400', i)}</ul>
                </li>
            `);
        }

        for (let i = 0; i < monthsNames.length; i++) {
            months1401.append(`
                <li>
                <span class="plus-list-style-bullet">+</span>
                <span class="minus-list-style-bullet none">-</span>
                <span class="month">${monthsNames[i]}</span>
                    <ul class="days">${addDaysHandler('1401', i)}</ul>
                </li>
            `);
        }

        function UlClickHandler(e, ref, hasYear, targetSliderEl) {
            e.preventDefault();
            $(ref)
                .parent()
                .find(`.${hasYear}plus-list-style-bullet`)
                .toggleClass('none');
            $(ref)
                .parent()
                .find(`.${hasYear}minus-list-style-bullet`)
                .toggleClass('none');
            $(ref).parent().find(targetSliderEl).slideToggle();
        }

        year.click(function (e) {
            var ref = this;
            UlClickHandler(e, ref, 'year-', '.months');
        });

        $('.month').click(function (e) {
            var ref = this;
            UlClickHandler(e, ref, '', 'ul');
        });

        $('.dates').click(function (e) {
            e.preventDefault();
            var selectedDate = $(this).text();
            renderApp(selectedDate);
        });
    }

    function currencyPrice() {
        function placingInDOM(currency, infoList) {
            function calcDollarChange() {
                return (
                    ((infoList[1].close - infoList[0].close) * 100) /
                    infoList[0].close
                );
            }

            function calcEuroChange() {
                return (
                    ((infoList[1].close - infoList[0].close) * 100) /
                    infoList[0].close
                );
            }

            var latestDollar = $('#latest-dollar'),
                highestDollar = $('#highest-dollar'),
                lowestDollar = $('#lowest-dollar'),
                changeDollar = $('#change-dollar'),
                latestEuro = $('#latest-euro'),
                highestEuro = $('#highest-euro'),
                lowestEuro = $('#lowest-euro'),
                changeEuro = $('#change-euro'),
                dollarCaret = $('.dollar-caret'),
                euroCaret = $('.euro-caret');
            function caretStyleHandler(param) {
                if (param === 'dollar') {
                    if (infoList[1].close - infoList[0].close < 0) {
                        dollarCaret.removeClass(
                            'bi-caret-up-fill text-success'
                        );
                        dollarCaret.addClass('bi-caret-down-fill text-danger');
                    } else {
                        dollarCaret.addClass('bi-caret-up-fill text-success');
                        dollarCaret.removeClass(
                            'bi-caret-down-fill text-danger'
                        );
                    }
                } else if (param === 'euro') {
                    if (infoList[1].close - infoList[0].close < 0) {
                        euroCaret.removeClass('bi-caret-up-fill text-success');
                        euroCaret.addClass('bi-caret-down-fill text-danger');
                    } else {
                        euroCaret.addClass('bi-caret-up-fill text-success');
                        euroCaret.removeClass('bi-caret-down-fill text-danger');
                    }
                }
            }

            if (currency === 'dollar') {
                caretStyleHandler('dollar');
                latestDollar.text(infoList[1].close);
                highestDollar.text(infoList[1].high);
                lowestDollar.text(infoList[1].low);
                var dollarChangeSinceYesterday = calcDollarChange()
                    .toString()
                    .substring(-1, 4);
                changeDollar.text(dollarChangeSinceYesterday);
            } else if (currency === 'euro') {
                caretStyleHandler('euro');
                latestEuro.text(infoList[1].close);
                highestEuro.text(infoList[1].high);
                lowestEuro.text(infoList[1].low);
                var euroChangeSinceYesterday = calcEuroChange()
                    .toString()
                    .substring(-1, 4);
                changeEuro.text(euroChangeSinceYesterday);
            }
        }

        function currencyRate(currency, year, month, day) {
            $.getJSON(
                `https://api.navasan.tech/ohlcSearch/?api_key=freeOZK3CpK1NNqRWYDEClj7t2jMh68W&item=${
                    currency === 'dollar' ? 'usd_sell' : 'eur'
                }&start=${year}-${month}-${
                    day - 2
                }&end=${year}-${month}-${day}`,
                function (result) {
                    placingInDOM(currency, result);
                    dollarGaugeChart(result[1].close);
                    euroGaugeChart(result[1].close);
                }
            );
        }

        function latestRate(selectedVal) {
            var thisYear, thisMonth, thisDay;

            if (selectedVal) {
                var splittedSelectedVal = selectedVal.split('-');
                (thisYear = splittedSelectedVal[0]),
                    (thisMonth = splittedSelectedVal[1]),
                    (thisDay = splittedSelectedVal[2]);
            } else {
                var todayDate = new Date(),
                    options = {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    },
                    todayShamsiDate = todayDate.toLocaleDateString(
                        'fa-IR-u-nu-latn',
                        options
                    );
                (thisYear = todayShamsiDate.substring(0, 4)),
                    (thisMonth = todayShamsiDate.substring(5, 7)),
                    (thisDay = todayShamsiDate.substring(8, 10));
            }

            currencyRate('dollar', thisYear, thisMonth, thisDay);
            currencyRate('euro', thisYear, thisMonth, thisDay);
        }

        latestRate(value);
    }

    function currencyPriceChart() {
        function n(selectedVal) {
            if (selectedVal) {
                var splittedSelectedVal = selectedVal.split('-');
                thisYear = splittedSelectedVal[0];
                thisMonth = splittedSelectedVal[1];
                thisDay = splittedSelectedVal[2];
            } else {
                var todayDate = new Date(),
                    options = {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    },
                    todayShamsiDate = todayDate.toLocaleDateString(
                        'fa-IR-u-nu-latn',
                        options
                    );
                thisYear = todayShamsiDate.substring(0, 4);
                thisMonth = todayShamsiDate.substring(5, 7);
                thisDay = todayShamsiDate.substring(8, 10);
            }

            function preparingResult(result) {
                var closePrices = [];
                console.log(result);
                for (let i = 0; i < result.length; i++) {
                    closePrices.push(result[i].close);
                }
                console.log(selectedVal, closePrices.indexOf(selectedVal));
                return closePrices;
            }

            $.getJSON(
                `https://api.navasan.tech/ohlcSearch/?api_key=freeOZK3CpK1NNqRWYDEClj7t2jMh68W&item=usd_sell&start=${thisYear}-${thisMonth}-1&end=${thisYear}-${thisMonth}-31`,
                function (EuroResult) {
                    var euroSeriesData = preparingResult(EuroResult);
                    $.getJSON(
                        `https://api.navasan.tech/ohlcSearch/?api_key=freeOZK3CpK1NNqRWYDEClj7t2jMh68W&item=eur&start=${thisYear}-${thisMonth}-1&end=${thisYear}-${thisMonth}-31`,
                        function (dollarResult) {
                            var dollarSeriesData =
                                preparingResult(dollarResult);
                            Highcharts.chart('container', {
                                chart: {
                                    type: 'spline',
                                },
                                title: {
                                    text: 'نمودار نوسانات ارز',
                                },
                                subtitle: {
                                    text: 'دلار و یورو',
                                },
                                xAxis: {
                                    categories: value ? l(value) : l(),
                                    accessibility: {
                                        description: 'Months of the year',
                                    },
                                },
                                yAxis: {
                                    title: {
                                        text: 'قیمت به تومان',
                                    },
                                    labels: {
                                        formatter: function () {
                                            return this.value + ',000';
                                        },
                                    },
                                },
                                tooltip: {
                                    crosshairs: true,
                                    shared: true,
                                },
                                plotOptions: {
                                    spline: {
                                        marker: {
                                            radius: 4,
                                            lineColor: '#666666',
                                            lineWidth: 1,
                                        },
                                    },
                                },
                                series: [
                                    {
                                        name: 'دلار',
                                        marker: {
                                            symbol: 'square',
                                        },
                                        data: dollarSeriesData,
                                    },
                                    {
                                        name: 'یورو',
                                        marker: {
                                            symbol: 'diamond',
                                        },
                                        data: euroSeriesData,
                                    },
                                ],
                            });
                        }
                    );
                }
            );
        }

        function l(selectedVal) {
            if (selectedVal) {
                var splittedSelectedVal = selectedVal.split('-');
                thisYear = splittedSelectedVal[0];
                thisMonth = splittedSelectedVal[1];
            } else {
                var todayDate = new Date(),
                    options = {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    },
                    todayShamsiDate = todayDate.toLocaleDateString(
                        'fa-IR-u-nu-latn',
                        options
                    );
                thisYear = todayShamsiDate.substring(0, 4);
                thisMonth = todayShamsiDate.substring(5, 7);
            }

            var xyz = [];

            for (let i = 1; i <= 31; i++) {
                xyz.push(`${thisYear}-${thisMonth}-${i}`);
            }

            return xyz;
        }

        if (value) {
            n(value);
        } else {
            n();
        }
    }

    var gaugeOptions = {
        chart: {
            type: 'solidgauge',
        },

        title: null,

        pane: {
            center: ['50%', '85%'],
            size: '140%',
            startAngle: -90,
            endAngle: 90,
            background: {
                backgroundColor:
                    Highcharts.defaultOptions.legend.backgroundColor || '#EEE',
                innerRadius: '60%',
                outerRadius: '100%',
                shape: 'arc',
            },
        },

        exporting: {
            enabled: false,
        },

        tooltip: {
            enabled: false,
        },

        // the value axis
        yAxis: {
            stops: [
                [0.1, '#55BF3B'], // green
                [0.5, '#DDDF0D'], // yellow
                [0.9, '#DF5353'], // red
            ],
            lineWidth: 0,
            tickWidth: 0,
            minorTickInterval: null,
            tickAmount: 2,
            title: {
                y: -70,
            },
            labels: {
                y: 16,
            },
        },

        plotOptions: {
            solidgauge: {
                dataLabels: {
                    y: 5,
                    borderWidth: 0,
                    useHTML: true,
                },
            },
        },
    };

    window.dollarGaugeChart = function (x) {
        var testVal = x;

        var chartSpeed = Highcharts.chart(
            'container-speed',
            Highcharts.merge(gaugeOptions, {
                yAxis: {
                    min: 0,
                    max: 40000,
                    title: {
                        text: 'نرخ روز',
                    },
                },

                credits: {
                    enabled: false,
                },

                series: [
                    {
                        name: 'Speed',
                        data: [testVal],
                        dataLabels: {
                            format:
                                '<div style="text-align:center">' +
                                '<span style="font-size:25px">{y}</span><br/>' +
                                '<span style="font-size:12px;opacity:0.4">به تومان</span>' +
                                '</div>',
                        },
                        tooltip: {
                            valueSuffix: ' km/h',
                        },
                    },
                ],
            })
        );
    };

    window.euroGaugeChart = function (x) {
        var testVal = x;

        var chartRpm = Highcharts.chart(
            'container-rpm',
            Highcharts.merge(gaugeOptions, {
                yAxis: {
                    min: 0,
                    max: 40000,
                    title: {
                        text: 'نرخ روز',
                    },
                },

                series: [
                    {
                        name: 'RPM',
                        data: [testVal],
                        dataLabels: {
                            format:
                                '<div style="text-align:center">' +
                                '<span style="font-size:25px">{y}</span><br/>' +
                                '<span style="font-size:12px;opacity:0.4">' +
                                'به تومان' +
                                '</span>' +
                                '</div>',
                        },
                        tooltip: {
                            valueSuffix: ' revolutions/min',
                        },
                    },
                ],
            })
        );
    };

    if (!value) {
        desiredDayPrice();
    }

    currencyPrice();
    currencyPriceChart();
    sideBarMenu();
}

function renderApp(value) {
    app(value);
}

renderApp();
