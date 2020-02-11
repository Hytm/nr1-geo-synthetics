import React, { PureComponent } from 'react';
import { Marker } from 'react-map-gl';
import { locationLatLng } from '../location'

const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z`;

const SIZE = 20;

export default class Pins extends PureComponent {
    getMarkerColor(sla) {
        let color = ''
        if (sla <= 90) {
            color = '#d00'
        }
        if (sla > 90) {
            color = '#ff5c06'
        }
        if (sla > 95) {
            color = '#fff41c'
        }
        if (sla > 98) {
            color = '#beff5f'
        }
        if (sla == 100) {
            color = '#00ee0b'
        }
        return color
    }

    getLongitude(locationLabel) {
        let lng = 0.0
        locationLatLng.forEach(l => {
            if (l.label === locationLabel) {
                lng = l.longitude
            }
        });
        return lng
    }

    getLatitude(locationLabel) {
        let lat = 0.0
        locationLatLng.forEach(l => {
            if (l.label === locationLabel) {
                lat = l.latitude
            }
        });
        return lat
    }

    render() {
        const { data, click } = this.props;
        return data.map((location, index) => (
            <Marker key={`marker-${index}`} longitude={this.getLongitude(location.locationLabel)} latitude={this.getLatitude(location.locationLabel)} >
                <svg
                    height={SIZE}
                    viewBox="0 0 24 24"
                    style={{
                        cursor: 'pointer',
                        fill: this.getMarkerColor(location.percentage),
                        stroke: 'none',
                        transform: `translate(${-SIZE / 2}px,${-SIZE}px)`
                    }}
                    onClick={() => click(location.locationLabel)}
                >
                    <path d={ICON} />
                </svg>
            </Marker>
        ))
    }
}