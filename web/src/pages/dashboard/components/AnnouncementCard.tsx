import React from 'react';
import { ActionIcon, Avatar, createStyles, Group, Menu, Stack, Text } from '@mantine/core';
import dayjs from 'dayjs';
import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import AnnouncementModal from './AnnouncementModal';
import { useEditor } from '@tiptap/react';
import { RichTextEditor } from '@mantine/tiptap';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extension-placeholder';
import { useConfig } from '../../../state/config';
import { Announcement, Character } from '../../../typings';
import { fetchNui } from '../../../utils/fetchNui';
import { queryClient } from '../../../main';

const useStyles = createStyles((theme) => ({
  announcementContainer: {
    backgroundColor: theme.colors.durple[4],
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.md,
    minHeight: 400, // TODO: fix issue with cursor running twice due to height not being set
  },
}));
interface Props {
  announcement: Announcement;
  character: Character;
}

const AnnouncementCard: React.FC<Props> = ({ announcement, character }) => {
  const { classes } = useStyles();
  const config = useConfig();

  const editor = useEditor({
    content: announcement.contents,
    editable: false,
    extensions: [
      StarterKit,
      Underline,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Announcement contents...' }),
    ],
  });

  return (
    <Stack className={classes.announcementContainer} p="md">
      <Group position="apart">
        <Group>
          <Avatar color="blue" />
          <Stack spacing={0}>
            <Text fw={500}>{`${announcement.firstName} ${announcement.lastName} · ${announcement.callSign}`}</Text>
            <Text size="xs" c="dark.2">
              {dayjs(announcement.createdAt).fromNow()}
            </Text>
          </Stack>
        </Group>
        <Menu position="bottom-end" offset={3} withArrow arrowPosition="center">
          <Menu.Target>
            <ActionIcon
              disabled={
                announcement.stateId !== character.stateId && character.grade < config.permissions.announcements.delete
              }
              size="lg"
              color="dark.2"
            >
              <IconDots />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              disabled={announcement.stateId !== character.stateId}
              icon={<IconEdit size={18} />}
              onClick={() => {
                modals.open({
                  title: 'Edit announcement',
                  centered: true,
                  children: <AnnouncementModal announcement={announcement} />,
                });
              }}
            >
              Edit
            </Menu.Item>
            <Menu.Item
              color="red"
              icon={<IconTrash size={18} />}
              onClick={() => {
                modals.openConfirmModal({
                  title: 'Delete announcement',
                  children: <Text>Are you sure you want to delete this announcement?</Text>,
                  labels: { confirm: 'Confirm', cancel: 'Cancel' },
                  centered: true,
                  confirmProps: {
                    color: 'red',
                  },
                  onConfirm: async () => {
                    console.log('pogchmap');
                    const resp = await fetchNui('deleteAnnouncement', announcement.id);
                    console.log(resp);
                    if (!resp) return;
                    await queryClient.invalidateQueries(['announcements']);
                    console.log('ok');
                  },
                });
              }}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
      <RichTextEditor
        editor={editor}
        styles={{
          root: { borderColor: 'transparent' },
          content: { '.ProseMirror': { padding: 0 } },
          typographyStylesProvider: { fontSize: 14 },
        }}
      >
        <RichTextEditor.Content />
      </RichTextEditor>
    </Stack>
  );
};

export default AnnouncementCard;
