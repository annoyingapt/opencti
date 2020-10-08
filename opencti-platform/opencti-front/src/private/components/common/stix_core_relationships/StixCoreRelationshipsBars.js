import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose, map, assoc } from 'ramda';
import graphql from 'babel-plugin-relay/macro';
import BarChart from 'recharts/lib/chart/BarChart';
import XAxis from 'recharts/lib/cartesian/XAxis';
import YAxis from 'recharts/lib/cartesian/YAxis';
import Cell from 'recharts/lib/component/Cell';
import CartesianGrid from 'recharts/lib/cartesian/CartesianGrid';
import Bar from 'recharts/lib/cartesian/Bar';
import ResponsiveContainer from 'recharts/lib/component/ResponsiveContainer';
import Tooltip from 'recharts/lib/component/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { QueryRenderer } from '../../../../relay/environment';
import inject18n from '../../../../components/i18n';
import { itemColor } from '../../../../utils/Colors';
import Theme from '../../../../components/ThemeDark';
import { truncate } from '../../../../utils/String';

const styles = () => ({
  paper: {
    margin: '10px 0 0 0',
    padding: 0,
    borderRadius: 6,
  },
});

const stixCoreRelationshipsBarsDistributionQuery = graphql`
  query StixCoreRelationshipsBarsDistributionQuery(
    $relationship_type: String!
    $toTypes: [String]
    $field: String!
    $operation: StatsOperation!
    $startDate: DateTime
    $endDate: DateTime
    $dateAttribute: String
    $limit: Int
  ) {
    stixCoreRelationshipsDistribution(
      relationship_type: $relationship_type
      toTypes: $toTypes
      field: $field
      operation: $operation
      startDate: $startDate
      endDate: $endDate
      dateAttribute: $dateAttribute
      limit: $limit
    ) {
      label
      value
      entity {
        ... on BasicObject {
          entity_type
        }
        ... on BasicRelationship {
            entity_type
        }
        ... on AttackPattern {
          name
          description
        }
        ... on Campaign {
          name
          description
        }
        ... on CourseOfAction {
          name
          description
        }
        ... on Individual {
          name
          description
        }
        ... on Organization {
          name
          description
        }
        ... on Sector {
          name
          description
        }
        ... on Indicator {
          name
          description
        }
        ... on Infrastructure {
          name
          description
        }
        ... on IntrusionSet {
          name
          description
        }
        ... on Position {
          name
          description
        }
        ... on City {
          name
          description
        }
        ... on Country {
          name
          description
        }
        ... on Region {
          name
          description
        }
        ... on Malware {
          name
          description
        }
        ... on ThreatActor {
          name
          description
        }
        ... on Tool {
          name
          description
        }
        ... on Vulnerability {
          name
          description
        }
        ... on XOpenCTIIncident {
          name
          description
        }
      }
    }
  }
`;

class StixCoreRelationshipsBars extends Component {
  tickFormatter(title) {
    return truncate(title.replace(/\[(.*?)\]/gi, ''), 100);
  }

  render() {
    const {
      t,
      classes,
      stixCoreObjectId,
      relationshipType,
      toTypes,
      field,
      title,
      height,
      startDate,
      endDate,
      dateAttribute,
    } = this.props;
    const stixDomainObjectsDistributionVariables = {
      fromId: stixCoreObjectId,
      relationship_type: relationshipType,
      toTypes,
      field: field || 'entity_type',
      operation: 'count',
      startDate,
      endDate,
      dateAttribute,
      limit: 8,
    };
    return (
      <div style={{ height: '100%' }}>
        <Typography variant="h4" gutterBottom={true}>
          {title || t('StixDomainObjects distribution')}
        </Typography>
        <Paper
          classes={{ root: classes.paper }}
          elevation={2}
          style={{ height: height || 300 }}
        >
          <QueryRenderer
            query={stixCoreRelationshipsBarsDistributionQuery}
            variables={stixDomainObjectsDistributionVariables}
            render={({ props }) => {
              if (
                props
                && props.stixCoreRelationshipsDistribution
                && props.stixCoreRelationshipsDistribution.length > 0
              ) {
                const data = map(
                  (n) => assoc(
                    'label',
                    `[${t(`entity_${n.entity.entity_type}`)}] ${
                      n.entity.name
                    }`,
                    n,
                  ),
                  props.stixCoreRelationshipsDistribution,
                );
                return (
                  <ResponsiveContainer height={height || 300} width="100%">
                    <BarChart
                      layout="vertical"
                      data={data}
                      margin={{
                        top: 20,
                        right: 20,
                        bottom: 0,
                        left: 0,
                      }}
                    >
                      <XAxis
                        type="number"
                        dataKey="value"
                        stroke="#ffffff"
                        allowDecimals={false}
                      />
                      <YAxis
                        stroke="#ffffff"
                        dataKey="label"
                        type="category"
                        angle={-30}
                        textAnchor="end"
                        tickFormatter={this.tickFormatter.bind(this)}
                      />
                      <CartesianGrid strokeDasharray="2 2" stroke="#0f181f" />
                      <Tooltip
                        cursor={{
                          fill: 'rgba(0, 0, 0, 0.2)',
                          stroke: 'rgba(0, 0, 0, 0.2)',
                          strokeWidth: 2,
                        }}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          fontSize: 12,
                          borderRadius: 10,
                        }}
                      />
                      <Bar
                        fill={Theme.palette.primary.main}
                        dataKey="value"
                        barSize={15}
                      >
                        {props.stixCoreRelationshipsDistribution.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={itemColor(entry.entity.entity_type)}
                            />
                          ),
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              }
              if (props) {
                return (
                  <div
                    style={{ display: 'table', height: '100%', width: '100%' }}
                  >
                    <span
                      style={{
                        display: 'table-cell',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                      }}
                    >
                      {t('No entities of this type has been found.')}
                    </span>
                  </div>
                );
              }
              return (
                <div
                  style={{ display: 'table', height: '100%', width: '100%' }}
                >
                  <span
                    style={{
                      display: 'table-cell',
                      verticalAlign: 'middle',
                      textAlign: 'center',
                    }}
                  >
                    <CircularProgress size={40} thickness={2} />
                  </span>
                </div>
              );
            }}
          />
        </Paper>
      </div>
    );
  }
}

StixCoreRelationshipsBars.propTypes = {
  relationshipType: PropTypes.string,
  toTypes: PropTypes.array,
  title: PropTypes.string,
  field: PropTypes.string,
  classes: PropTypes.object,
  t: PropTypes.func,
  height: PropTypes.number,
  startDate: PropTypes.object,
  endDate: PropTypes.object,
  dateAttribute: PropTypes.string,
};

export default compose(
  inject18n,
  withStyles(styles),
)(StixCoreRelationshipsBars);
