import React from 'react';
import ReactMapGL from 'react-map-gl';
import {
    Grid,
    GridItem,
    PlatformStateContext,
    NerdletStateContext,
    BillboardChart,
    Dropdown,
    DropdownItem,
    Icon,
    Button,
    BarChart,
    HeadingText,
    NerdGraphQuery,
    Spinner,
    BlockText,
    navigation,
    LineChart
} from 'nr1';
import Pins from './components/Pins'
import AccountPicker from './components/AccountPicker';

const MAPBOX_TOKEN = "{YOUR_MAPBOX_TOKEN}"

export default class GeoSynthetics extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            accountId: null,
            since: "SINCE 1 day ago",
            timePickerTitle: "Last Day",
            whereClause: "",
            viewport: {
                latitude: 10.5731,
                longitude: -7.5898,
                zoom: 1.5,
                bearing: 0,
                pitch: 0
            },
            location: ""
        };

        this.setLocation = this.setLocation.bind(this);
        this.accountChange = this.accountChange.bind(this);
    }

    accountChange(account) {
        this.setState(
            {
                accountId: account.id
            },
            () => this.loadData()
        );
    }

    timeSelector(timeRange, title) {
        let sinceClause = "SINCE 1 day ago"
        let prevPeriodSinceClause = "SINCE 1 day ago"
        switch (timeRange) {
            case "DAY":
                sinceClause = "SINCE 1 day ago"
                break;
            case "WEEK":
                sinceClause = "SINCE 1 week ago"
                break;
            case "MONTH":
                sinceClause = "SINCE 1 month ago"
                break;
            case "QTR":
                sinceClause = "SINCE 3 months ago"
                break;
            case "YEAR":
                sinceClause = "SINCE 12 months ago"
                break;
        }
        this.setState({ since: sinceClause, timePickerTitle: title, prevPeriodSinceClause: prevPeriodSinceClause })
    }

    setLocation(label) {
        this.setState({ location: label })
        this.setState({ whereClause: `WHERE locationLabel = '${label}'` })
    }

    resetLocation() {
        this.setState({ location: "" })
        this.setState({ whereClause: "" })
    }

    getData(accountId, since) {
        const query = `{
            actor {
            account(id: ${accountId}) {
                data: nrql(query: "SELECT percentage(count(result), where result = 'SUCCESS') FROM SyntheticCheck ${since} FACET locationLabel") {
                results
                nrql
                }
            }
            }
        }`;
        return query;
    }

    navigateTo(name) {
        const q = NerdGraphQuery.query({
            query: `{
            actor {
                    entitySearch(query: "name = '${name}'") {
                        results {
                            entities {
                                guid
                            }
                        }
                    }
                }
            }` });
        q.then(results => {
            const guid = results.data.actor.entitySearch.results.entities[0].guid
            navigation.openStackedEntity(guid)
        }).catch((error) => { console.log(error); })
    }

    loadData() {
        let div = ""
        if (this.state.accountId && this.state.accountId !== "") {
            div = <Grid>
                <GridItem columnSpan={12}>
                    <Grid>
                        <GridItem columnSpan={2}>
                            <Grid>
                                <GridItem columnSpan={6}>
                                    <BlockText spacingType={[BlockText.SPACING_TYPE.MEDIUM]}>
                                        Select your account
                                    </BlockText>
                                </GridItem>
                                <GridItem columnSpan={6}>
                                    <Icon sizeType={Icon.SIZE_TYPE.MEDIUM} type={Icon.TYPE.INTERFACE__STATE__LOADING} />
                                    <AccountPicker onChange={this.accountChange} />
                                </GridItem>
                                <GridItem columnSpan={6}>
                                    <BlockText spacingType={[BlockText.SPACING_TYPE.MEDIUM]}>
                                        Select your timeframe
                                    </BlockText>
                                </GridItem>
                                <GridItem columnSpan={6}>
                                    <Icon sizeType={Icon.SIZE_TYPE.MEDIUM} type={Icon.TYPE.DATE_AND_TIME__DATE_AND_TIME__TIME} />
                                    <Dropdown className="TimePicker" title={this.state.timePickerTitle} timeSelector={this.timeSelector}>
                                        <DropdownItem onClick={() => { this.timeSelector("DAY", "Last Day") }}>Day</DropdownItem>
                                        <DropdownItem onClick={() => { this.timeSelector("WEEK", "Last Week") }}>Week</DropdownItem>
                                        <DropdownItem onClick={() => { this.timeSelector("MONTH", "Last Month") }}>Month</DropdownItem>
                                        <DropdownItem onClick={() => { this.timeSelector("QTR", "Last Quarter") }}>Quarter</DropdownItem>
                                        <DropdownItem onClick={() => { this.timeSelector("YEAR", "Last Year") }}>Year</DropdownItem>
                                    </Dropdown>
                                </GridItem>
                                <GridItem columnSpan={12} className="info">
                                    <BlockText>
                                        <p>Click on a marker to get details from this location</p>
                                    </BlockText>
                                </GridItem>
                            </Grid>
                        </GridItem>
                        <GridItem columnSpan={5}>
                            <HeadingText>
                                {this.state.location}
                            </HeadingText>
                            <BillboardChart
                                fullWidth
                                accountId={this.state.accountId}
                                query={`SELECT count(*) as ' Checks', percentage(count(result), where result = 'SUCCESS') AS 'SLA' 
                                        FROM SyntheticCheck ${this.state.whereClause} ${this.state.since}`}
                            />
                        </GridItem>
                        <GridItem columnSpan={5}>
                            <HeadingText>
                                {this.state.location}
                            </HeadingText>
                            <LineChart
                                fullWidth
                                accountId={this.state.accountId}
                                query={`SELECT percentage(count(result), where result = 'SUCCESS') AS 'SLA' 
                                    FROM SyntheticCheck ${this.state.whereClause} ${this.state.since} TIMESERIES AUTO`}
                            />
                        </GridItem>
                    </Grid>
                </GridItem>
                <GridItem columnSpan={this.state.location !== "" ? 8 : 12}>
                    <NerdGraphQuery
                        query={this.getData(this.state.accountId, this.state.since)}
                    >
                        {({ loading, error, data }) => {
                            if (loading) {
                                return <Spinner fillContainer />;
                            }
                            if (error) {
                                return (
                                    <div>
                                        <HeadingText>An error ocurred</HeadingText>
                                        <p>{error.message}</p>
                                    </div>
                                );
                            }
                            const { results } = data.actor.account.data;
                            return (
                                <ReactMapGL
                                    {...this.state.viewport}
                                    width="100%"
                                    height="100vh"
                                    onViewportChange={viewport => this.setState({ viewport })}
                                    mapboxApiAccessToken={MAPBOX_TOKEN}
                                >
                                    <Pins
                                        data={results}
                                        click={this.setLocation}
                                    >
                                    </Pins>
                                </ReactMapGL>
                            );
                        }}
                    </NerdGraphQuery>
                </GridItem>
                {this.state.location && <GridItem columnSpan={this.state.location !== "" ? 4 : 0}>
                    <HeadingText>
                        Details for location {this.state.location}
                    </HeadingText>
                    <HeadingText>
                        SLA
                                    </HeadingText>
                    <BarChart
                        fullWidth={true}
                        accountId={this.state.accountId}
                        onClickBar={(dataEl) => {
                            this.navigateTo([dataEl.metadata.name]);
                        }}
                        query={`SELECT percentage(count(result), where result = 'SUCCESS') AS 'SLA' from SyntheticCheck ${this.state.whereClause} FACET monitorName ${this.state.since}`}
                    />
                    <HeadingText>
                        Checks done
                                    </HeadingText>
                    <BarChart
                        fullWidth={true}
                        accountId={this.state.accountId}
                        onClickBar={(dataEl) => {
                            this.navigateTo([dataEl.metadata.name]);
                        }}
                        query={`SELECT count(*) from SyntheticCheck ${this.state.whereClause} FACET monitorName ${this.state.since}`}
                    />
                    <Button
                        onClick={() => this.resetLocation()}
                        type={Button.TYPE.PRIMARY}
                        iconType={Button.ICON_TYPE.INTERFACE__ARROW__ARROW_DIAGONAL_TOP_LEFT}
                    >
                        Return to world map
                    </Button>
                </GridItem>
                }
            </Grid>
        } else {
            div = <HeadingText>
                Please select an account to look at.
                <AccountPicker onChange={this.accountChange} />
            </HeadingText>
        }
        return div
    }

    render() {

        return (
            <PlatformStateContext.Consumer>
                {launcherUrlState => (
                    <NerdletStateContext.Consumer>
                        {nerdletUrlState => (
                            this.loadData()
                        )}
                    </NerdletStateContext.Consumer>
                )
                }
            </PlatformStateContext.Consumer>
        );
    }
}
