"use client";

import { UserButton } from "@/components/auth";

import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { useMutation, useQuery } from "convex/react";
import { Calendar, FileText, Plus } from "lucide-react";
import { useState } from "react";

import { api } from "../../convex/_generated/api";

export default function DashboardPage() {
  const user = useQuery(api.auth.currentUser);
  const notes = useQuery(api.notes.getUserNotes);
  const createNote = useMutation(api.notes.createNote);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newNoteTitle.trim() && newNoteContent.trim()) {
      await createNote({
        title: newNoteTitle,
        content: newNoteContent,
      });
      setNewNoteTitle("");
      setNewNoteContent("");
    }
  };

  return (
    <Box className="space-y-4">
      <Flex align="center" justify="between">
        <Heading size="6">Dashboard</Heading>
        <UserButton />
      </Flex>

      {user && (
        <Card>
          <Flex direction="column" gap="1">
            <Text size="3" weight="medium" className="text-base">
              Welcome back, {user.name || user.email || "Anonymous"}!
            </Text>
            {user.email && (
              <Text size="2" className="text-gray-11">
                {user.email}
              </Text>
            )}
          </Flex>
        </Card>
      )}

      <Box className="space-y-3">
        <Heading size="4">Your Notes</Heading>

        <Card>
          <form onSubmit={handleCreateNote}>
            <Flex direction="column" gap="3">
              <TextField.Root
                placeholder="Note title"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                required
              />

              <TextArea
                placeholder="Write your note here..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={4}
                required
              />

              <Button type="submit" variant="solid" size="2">
                <Plus className="size-4" />
                Create Note
              </Button>
            </Flex>
          </form>
        </Card>

        <Grid columns={{ initial: "1", md: "2" }} gap="3">
          {notes?.map((note) => (
            <Card key={note._id}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <FileText className="size-4 text-gray-11" />
                  <Text size="3" weight="medium" className="text-base">
                    {note.title}
                  </Text>
                </Flex>

                <Text size="2" className="text-gray-11 leading-relaxed">
                  {note.content}
                </Text>

                <Flex align="center" gap="1" mt="1">
                  <Calendar className="size-3 text-gray-10" />
                  <Text size="1" className="text-gray-10">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </Text>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Grid>

        {notes?.length === 0 && (
          <Card>
            <Flex direction="column" align="center" gap="2" py="6">
              <FileText className="size-8 text-gray-9" />
              <Text size="2" className="text-gray-11">
                No notes yet. Create your first note above.
              </Text>
            </Flex>
          </Card>
        )}
      </Box>
    </Box>
  );
}
