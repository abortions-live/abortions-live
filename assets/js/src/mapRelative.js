async function mapRelative(lng, lat) {
    var geojson = await mapGeojson()
    mapboxgl.accessToken = 'pk.eyJ1IjoidzdxdHRuZWxteGUyIiwiYSI6ImNreXlpb3h1dDBhOGIydXA5anhwdDlrb3AifQ.leDi1Lh3LAr-CfWS572-zA';
    const mapRelative = new mapboxgl.Map({
        container: 'mapRelative',
        zoom: 1,
        center: [lng, lat],
        style: 'mapbox://styles/w7qttnelmxe2/ckz01m5qt001r14n0122ay1d6'
    });

    // filters for classifying abortions into five categories based on relativenitude
    const relative1 = ['<', ['get', 'relative'], 10];
    const relative2 = ['all', ['>=', ['get', 'relative'], 10], ['<', ['get', 'relative'], 250]];
    const relative3 = ['all', ['>=', ['get', 'relative'], 250], ['<', ['get', 'relative'], 50]];
    const relative4 = ['all', ['>=', ['get', 'relative'], 50], ['<', ['get', 'relative'], 750]];
    const relative5 = ['>=', ['get', 'relative'], 750];

    // colors to use for the categories
    const colors = ['#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c'];

    mapRelative.on('load', () => {
        // add a clustered GeoJSON source for a sample set of abortions
        mapRelative.addSource('abortions', {
            'type': 'geojson',
            'data': geojson,
            'cluster': true,
            'clusterRadius': 80,
            'clusterProperties': {
                // keep separate counts for each relativenitude category in a cluster
                'relative1': ['+', ['case', relative1, 1, 0]],
                'relative2': ['+', ['case', relative2, 1, 0]],
                'relative3': ['+', ['case', relative3, 1, 0]],
                'relative4': ['+', ['case', relative4, 1, 0]],
                'relative5': ['+', ['case', relative5, 1, 0]]
            }
        });
        // circle and symbol layers for rendering individual abortions (unclustered points)
        mapRelative.addLayer({
            'id': 'abortion_circle',
            'type': 'circle',
            'source': 'abortions',
            'filter': ['!=', 'cluster', true],
            'paint': {
                 'circle-color': [
                    'case',
                    relative1,
                    colors[0],
                    relative2,
                    colors[1],
                    relative3,
                    colors[2],
                    relative4,
                    colors[3],
                    colors[4]
                ],
                'circle-opacity': 0.6,
                'circle-radius': 25
            }
        });
        mapRelative.addLayer({
            'id': 'abortion_label',
            'type': 'symbol',
            'source': 'abortions',
            'filter': ['!=', 'cluster', true],
            'layout': {
                'text-field': [
                    'number-format',
                    ['get', 'relative'],
                    { 'min-fraction-digits': 1, 'max-fraction-digits': 1 }
                ],
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                'text-size': 10
            },
            'paint': {
                'text-color': [
                    'case',
                    ['<', ['get', 'relative'], 50],
                    'black',
                    'white'
                ]
            }
        });

        // objects for caching and keeping track of HTML marker objects (for performance)
        const markers = {};
        let markersOnScreen = {};

        function updateMarkers() {
            const newMarkers = {};
            const features = mapRelative.querySourceFeatures('abortions');

            // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
            // and add it to the map if it's not there already
            for (const feature of features) {
                const coords = feature.geometry.coordinates;
                const props = feature.properties;
                if (!props.cluster) continue;
                const id = props.cluster_id;

                let marker = markers[id];
                if (!marker) {
                    const el = createDonutChart(props);
                    marker = markers[id] = new mapboxgl.Marker({
                        element: el
                    }).setLngLat(coords);
                }
                newMarkers[id] = marker;

                if (!markersOnScreen[id]) marker.addTo(mapRelative);
            }
            // for every marker we've added previously, remove those that are no longer visible
            for (const id in markersOnScreen) {
                if (!newMarkers[id]) markersOnScreen[id].remove();
            }
            markersOnScreen = newMarkers;
        }

        // after the GeoJSON data is loaded, update markers on the screen on every frame
        mapRelative.on('render', () => {
            if (!mapRelative.isSourceLoaded('abortions')) return;
            updateMarkers();
        });
    });

    // code for creating an SVG donut chart from feature properties
    function createDonutChart(props) {
        const offsets = [];
        const counts = [
            props.relative1,
            props.relative2,
            props.relative3,
            props.relative4,
            props.relative5
        ];
        let total = 0;
        for (const count of counts) {
            offsets.push(total);
            total += count;
        }
        const fontSize = total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 18 : 16;
        const r = total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
        const r0 = Math.round(r * 0.6);
        const w = r * 2;

        let html = `<div><svg width="${w}" height="${w}" viewbox="0 0 ${w} ${w}" text-anchor="middle" style="font: ${fontSize}px sans-serif; display: block">`;

        for (let i = 0; i < counts.length; i++) {
            html += donutSegment(
                offsets[i] / total,
                (offsets[i] + counts[i]) / total,
                r,
                r0,
                colors[i]
            );
        }
        html += `<circle cx="${r}" cy="${r}" r="${r0}" fill="white" />
            <text dominant-baseline="central" transform="translate(${r}, ${r})">
                ${total.toLocaleString()}
            </text>
            </svg>
            </div>`;

        const el = document.createElement('div');
        el.innerHTML = html;
        return el.firstChild;
    }

    function donutSegment(start, end, r, r0, color) {
        if (end - start === 1) end -= 0.00001;
        const a0 = 2 * Math.PI * (start - 0.25);
        const a1 = 2 * Math.PI * (end - 0.25);
        const x0 = Math.cos(a0),
            y0 = Math.sin(a0);
        const x1 = Math.cos(a1),
            y1 = Math.sin(a1);
        const largeArc = end - start > 0.5 ? 1 : 0;

        // draw an SVG path
        return `<path d="M ${r + r0 * x0} ${r + r0 * y0} L ${r + r * x0} ${
            r + r * y0
        } A ${r} ${r} 0 ${largeArc} 1 ${r + r * x1} ${r + r * y1} L ${
            r + r0 * x1
        } ${r + r0 * y1} A ${r0} ${r0} 0 ${largeArc} 0 ${r + r0 * x0} ${
            r + r0 * y0
        }" fill="${color}" />`;
    }
}