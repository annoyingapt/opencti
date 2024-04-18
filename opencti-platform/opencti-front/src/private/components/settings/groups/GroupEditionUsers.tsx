import React, { FunctionComponent } from 'react';
import { graphql, PreloadedQuery, useMutation, usePreloadedQuery } from 'react-relay';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import { PersonOutlined } from '@mui/icons-material';
import { UsersLinesSearchQuery } from '@components/settings/users/__generated__/UsersLinesSearchQuery.graphql';
import { GroupEditionContainer_group$data } from '@components/settings/groups/__generated__/GroupEditionContainer_group.graphql';
import { GroupUsersLinesQuery$variables } from '@components/settings/users/__generated__/GroupUsersLinesQuery.graphql';
import { usersLinesSearchQuery } from '../users/UsersLines';
import { deleteNodeFromId, insertNode } from '../../../../utils/store';

const userMutationRelationAdd = graphql`
  mutation GroupEditionUsersRelationAddMutation(
    $id: ID!
    $input: InternalRelationshipAddInput!
  ) {
    groupEdit(id: $id) {
      relationAdd(input: $input) {
        to {
          ...GroupEditionContainer_group
        }
        from {
          ...UserLine_node
        }
      }
    }
  }
`;

const userMutationRelationDelete = graphql`
  mutation GroupEditionUsersRelationDeleteMutation(
    $id: ID!
    $fromId: StixRef!
    $relationship_type: String!
  ) {
    groupEdit(id: $id) {
      relationDelete(fromId: $fromId, relationship_type: $relationship_type) {
        id
        ...GroupEditionContainer_group
      }
    }
  }
`;

interface GroupEditionUsersProps {
  group: GroupEditionContainer_group$data,
  queryRef: PreloadedQuery<UsersLinesSearchQuery>,
  paginationOptionsForUpdater: GroupUsersLinesQuery$variables,
}

const GroupEditionUsers: FunctionComponent<GroupEditionUsersProps> = ({ group, queryRef, paginationOptionsForUpdater }) => {
  const groupId = group.id;
  const groupUsers = group.members?.edges?.map((n) => ({ id: n.node.id })) ?? [];
  const usersData = usePreloadedQuery<UsersLinesSearchQuery>(usersLinesSearchQuery, queryRef);
  const users = usersData.users?.edges.map((n) => n.node) ?? [];

  const [commitAddUser] = useMutation(userMutationRelationAdd);
  const [commitRemoveUser] = useMutation(userMutationRelationDelete);
  const handleToggle = (userId: string, groupUser: { id: string } | undefined, event: React.ChangeEvent<HTMLInputElement>) => {
    const input = {
      fromId: userId,
      relationship_type: 'member-of',
    };
    if (event.target.checked) {
      commitAddUser({
        variables: {
          id: groupId,
          input,
        },
        updater: (store) => {
          insertNode(
            store,
            'Pagination_group_members',
            paginationOptionsForUpdater,
            'groupEdit',
            groupId,
            'relationAdd',
            { input },
            'from',
          );
        },
      });
    } else if (groupUser !== undefined) {
      commitRemoveUser({
        variables: {
          id: groupId,
          fromId: groupUser.id,
          relationship_type: 'member-of',
        },
        updater: (store) => {
          deleteNodeFromId(store, groupId, 'Pagination_group_members', paginationOptionsForUpdater, groupUser.id);
        },
      });
    }
  };

  return (
    <List dense={true}>
      {users.map((user) => {
        const groupUser = groupUsers.find((g) => g.id === user.id);
        return (
          <ListItem key={user.id} divider={true}>
            <ListItemIcon color="primary">
              <PersonOutlined/>
            </ListItemIcon>
            <ListItemText
              primary={user.name}
              secondary={user.user_email}
            />
            <ListItemSecondaryAction>
              <Checkbox
                onChange={(event) => handleToggle(
                  user.id,
                  groupUser,
                  event,
                )}
                checked={groupUser !== undefined}
              />
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
  );
};

export default GroupEditionUsers;