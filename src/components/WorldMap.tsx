import * as d3 from "d3";
import React, { ReactElement, useMemo } from "react";
import * as topojson from "topojson-client";
import * as GeoJSON from "geojson";

import timezoneTopoJson from "../assets/timezones.json";
import { RawTimeZone, rawTimeZones } from "@vvo/tzdb";

type PolygonFeature = GeoJSON.Feature<
  GeoJSON.Polygon,
  GeoJSON.GeoJsonProperties
>;

const findTimeZone = (timeZoneName: string): RawTimeZone =>
  rawTimeZones.find(
    timeZone =>
      timeZoneName === timeZone.name || timeZone.group.includes(timeZoneName),
  );

/**
 * Read world map polygon data.
 * @returns array of polygon data
 */
const createTimeZonePolygonFeatures = (): PolygonFeature[] => {
  // Read world map for timezones.
  // See https://github.com/evansiroky/timezone-boundary-builder
  //     https://github.com/topojson/topojson
  const tzData = timezoneTopoJson;
  const tzDataFeature = topojson.feature(tzData, tzData.objects.timezones);
  return (tzDataFeature as { features: PolygonFeature[] }).features;
};

interface WorldMapProps {
  /** Time zone name selected e.g. "Asia/Tokyo" */
  timeZoneName: string;
  /** Called when a timezone is selected. */
  onChange?: (timeZoneName: string) => void;

  selectedOffsetStroke?: string;
  selectedOffsetFill?: string;
  selectedTimeZoneStroke?: string;
  selectedTimeZoneFill?: string;
  defaultFill?: string;
  defaultStroke?: string;
}

const WorldMap = (props: WorldMapProps): ReactElement => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleClick = (e: any) => {
    // We have a few "unresolved" areas on map. We ignore clicking on those areas.
    const timezone = findTimeZone(e.target.id);
    if (timezone && props.onChange !== undefined) {
      props.onChange(timezone.name);
    }
  };

  const pathGenerator = d3.geoPath();
  const timeZonePolygonFeatures = useMemo(createTimeZonePolygonFeatures, []);
  const selectedTimeZone = findTimeZone(props.timeZoneName);
  const tzPaths = useMemo(
    () =>
      timeZonePolygonFeatures.map((d: PolygonFeature) => {
        const id = `${d.properties?.id}`;
        // Time zone corresponding to the polygon.
        const timeZone = findTimeZone(id);
        let opacity;
        let stroke;
        let fill;
        if (selectedTimeZone && selectedTimeZone === timeZone) {
          opacity = 1.0;
          stroke = props.selectedTimeZoneStroke || "#005689";
          fill = props.selectedTimeZoneFill || "#c8d9eb";
        } else if (
          selectedTimeZone &&
          timeZone &&
          selectedTimeZone.rawOffsetInMinutes === timeZone.rawOffsetInMinutes
        ) {
          opacity = 0.7;
          stroke = props.selectedOffsetStroke || "#005689";
          fill = props.selectedOffsetFill || "#ecf2f9";
        } else {
          opacity = 0.4;
          stroke = props.defaultStroke || "lightgrey";
          fill = props.defaultFill || "lightgrey";
        }

        const generatedPath = pathGenerator(d) || undefined;
        const title = timeZone
          ? `${timeZone.countryName} / ${timeZone.mainCities[0]}`
          : "";
        return (
          <path
            id={id}
            key={id}
            data-testid={id}
            d={generatedPath}
            opacity={opacity}
            fill={fill}
            strokeWidth={0.5}
            stroke={stroke}
            onClick={handleClick}
          >
            <title>{title}</title>
          </path>
        );
      }),
    [timeZonePolygonFeatures, selectedTimeZone],
  );

  return (
    <svg viewBox="0 10 800 320" width="100%">
      <g style={{ cursor: "pointer" }} transform="matrix(2 0 0 -2.1 400 200)">
        {tzPaths}
      </g>
    </svg>
  );
};

export default WorldMap;
