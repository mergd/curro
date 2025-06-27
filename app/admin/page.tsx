"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { Pencil1Icon, PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Select,
  Table,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useAction, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

type Company = {
  _id: Id<"companies">;
  _creationTime: number;
  name: string;
  website?: string;
  logoUrl?: string;
  jobBoardUrl: string;
  sourceType: "ashby" | "greenhouse" | "other";
  numberOfEmployees?: string;
  stage?:
    | "pre-seed"
    | "seed"
    | "series-a"
    | "series-b"
    | "series-c"
    | "series-d"
    | "series-e"
    | "growth"
    | "pre-ipo"
    | "public"
    | "acquired";
  tags?: string[];
  locations?: string[];
  recentFinancing?: { amount: string; date: string };
  investors?: string[];
  lastScraped?: number;
};

type CompanyFormData = {
  name: string;
  website: string;
  logoUrl: string;
  jobBoardUrl: string;
  sourceType: "ashby" | "greenhouse" | "other";
  numberOfEmployees: string;
  stage: string;
  tags: string;
  locations: string;
  recentFinancing: { amount: string; date: string };
  investors: string;
};

export default function AdminPage() {
  const companies = useQuery(api.companies.list);
  const createCompany = useMutation(api.companies.create);
  const updateCompany = useMutation(api.companies.update);
  const removeCompany = useMutation(api.companies.remove);
  const scrapeCompany = useAction(api.scraper.scrape);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const createForm = useForm<CompanyFormData>({
    defaultValues: {
      name: "",
      website: "",
      logoUrl: "",
      jobBoardUrl: "",
      sourceType: "other",
      numberOfEmployees: "",
      stage: "",
      tags: "",
      locations: "",
      recentFinancing: { amount: "", date: "" },
      investors: "",
    },
  });

  const editForm = useForm<CompanyFormData>({
    defaultValues: {
      name: "",
      website: "",
      logoUrl: "",
      jobBoardUrl: "",
      sourceType: "other",
      numberOfEmployees: "",
      stage: "",
      tags: "",
      locations: "",
      recentFinancing: { amount: "", date: "" },
      investors: "",
    },
  });

  const handleCreate = createForm.handleSubmit(async (formData) => {
    const data = {
      name: formData.name,
      jobBoardUrl: formData.jobBoardUrl,
      sourceType: formData.sourceType,
      website: formData.website || undefined,
      logoUrl: formData.logoUrl || undefined,
      numberOfEmployees: formData.numberOfEmployees || undefined,
      stage: (formData.stage as Company["stage"]) || undefined,
      tags: formData.tags
        ? formData.tags.split(",").map((t) => t.trim())
        : undefined,
      locations: formData.locations
        ? formData.locations.split(",").map((l) => l.trim())
        : undefined,
      investors: formData.investors
        ? formData.investors.split(",").map((i) => i.trim())
        : undefined,
      recentFinancing:
        formData.recentFinancing.amount && formData.recentFinancing.date
          ? formData.recentFinancing
          : undefined,
    };

    await createCompany(data);
    setShowCreateDialog(false);
    createForm.reset();
  });

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    editForm.reset({
      name: company.name,
      website: company.website || "",
      logoUrl: company.logoUrl || "",
      jobBoardUrl: company.jobBoardUrl,
      sourceType: company.sourceType,
      numberOfEmployees: company.numberOfEmployees || "",
      stage: company.stage || "",
      tags: company.tags?.join(", ") || "",
      locations: company.locations?.join(", ") || "",
      recentFinancing: company.recentFinancing || { amount: "", date: "" },
      investors: company.investors?.join(", ") || "",
    });
  };

  const handleUpdate = editForm.handleSubmit(async (formData) => {
    if (!editingCompany) return;

    const data = {
      id: editingCompany._id,
      name: formData.name,
      website: formData.website || undefined,
      logoUrl: formData.logoUrl || undefined,
      jobBoardUrl: formData.jobBoardUrl,
      sourceType: formData.sourceType,
      numberOfEmployees: formData.numberOfEmployees || undefined,
      stage: (formData.stage as Company["stage"]) || undefined,
      tags: formData.tags
        ? formData.tags.split(",").map((t) => t.trim())
        : undefined,
      locations: formData.locations
        ? formData.locations.split(",").map((l) => l.trim())
        : undefined,
      investors: formData.investors
        ? formData.investors.split(",").map((i) => i.trim())
        : undefined,
      recentFinancing:
        formData.recentFinancing.amount && formData.recentFinancing.date
          ? formData.recentFinancing
          : undefined,
    };

    await updateCompany(data);
    setEditingCompany(null);
    editForm.reset();
  });

  const handleDelete = async (id: Id<"companies">) => {
    if (confirm("Are you sure you want to delete this company?")) {
      await removeCompany({ id });
    }
  };

  const handleScrape = async (companyId: Id<"companies">) => {
    try {
      await scrapeCompany({ companyId });
      alert("Scraping initiated successfully!");
    } catch (error) {
      alert("Failed to start scraping: " + (error as Error).message);
    }
  };

  const formatLastScraped = (timestamp?: number) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  const stageOptions = [
    "pre-seed",
    "seed",
    "series-a",
    "series-b",
    "series-c",
    "series-d",
    "series-e",
    "growth",
    "pre-ipo",
    "public",
    "acquired",
  ];

  if (!companies) {
    return (
      <Container size="4" className="py-8">
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container size="4" className="py-8">
      <Flex justify="between" align="center" className="mb-6">
        <Heading size="8">Company Administration</Heading>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusIcon />
          Add Company
        </Button>
      </Flex>

      <Card>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Company</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Job Board URL</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>ATS Type</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Stage</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Last Scraped</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {companies.map((company) => (
              <Table.Row key={company._id}>
                <Table.Cell>
                  <Flex direction="column" gap="1">
                    <Text weight="bold">{company.name}</Text>
                    {company.website && (
                      <Text size="2" color="gray">
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {company.website}
                        </a>
                      </Text>
                    )}
                    {company.tags && company.tags.length > 0 && (
                      <Flex gap="1" wrap="wrap">
                        {company.tags.map((tag, i) => (
                          <Badge key={i} size="1" variant="soft">
                            {tag}
                          </Badge>
                        ))}
                      </Flex>
                    )}
                  </Flex>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2" className="font-mono">
                    <a
                      href={company.jobBoardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {company.jobBoardUrl}
                    </a>
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge variant="outline">{company.sourceType}</Badge>
                </Table.Cell>
                <Table.Cell>
                  {company.stage && <Badge color="blue">{company.stage}</Badge>}
                </Table.Cell>
                <Table.Cell>
                  <Text size="2">{formatLastScraped(company.lastScraped)}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Flex gap="2">
                    <IconButton
                      size="1"
                      variant="ghost"
                      onClick={() => handleEdit(company)}
                    >
                      <Pencil1Icon />
                    </IconButton>
                    <IconButton
                      size="1"
                      variant="ghost"
                      color="red"
                      onClick={() => handleDelete(company._id)}
                    >
                      <TrashIcon />
                    </IconButton>
                    <Button
                      size="1"
                      variant="soft"
                      onClick={() => handleScrape(company._id)}
                    >
                      Scrape
                    </Button>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Card>

      {/* Create Dialog */}
      <Dialog.Root open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <Dialog.Content style={{ maxWidth: 600 }}>
          <Dialog.Title>Add New Company</Dialog.Title>
          <Dialog.Description>
            Fill in the details to add a new company to the job board.
          </Dialog.Description>

          <Flex direction="column" gap="3" className="mt-4">
            <Box>
              <Text as="label" size="2" weight="bold">
                Company Name *
              </Text>
              <TextField.Root
                {...createForm.register("name", {
                  required: "Company name is required",
                })}
                placeholder="Company Name"
              />
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold">
                Website
              </Text>
              <TextField.Root
                {...createForm.register("website")}
                placeholder="https://company.com"
              />
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold">
                Job Board URL *
              </Text>
              <TextField.Root
                {...createForm.register("jobBoardUrl", {
                  required: "Job board URL is required",
                })}
                placeholder="https://company.com/careers"
              />
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold">
                ATS Type
              </Text>
              <Select.Root
                value={createForm.watch("sourceType")}
                onValueChange={(value: "ashby" | "greenhouse" | "other") =>
                  createForm.setValue("sourceType", value)
                }
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="ashby">Ashby</Select.Item>
                  <Select.Item value="greenhouse">Greenhouse</Select.Item>
                  <Select.Item value="other">Other</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
            {/* 
            <Box>
              <Text as="label" size="2" weight="bold">
                Company Stage
              </Text>
              <Select.Root
                value={createForm.watch("stage")}
                onValueChange={(value) => createForm.setValue("stage", value)}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="" >Select Stage</Select.Item>
                  {stageOptions.map((stage) => (
                    <Select.Item key={stage} value={stage}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box> */}

            <Box>
              <Text as="label" size="2" weight="bold">
                Tags (comma-separated)
              </Text>
              <TextField.Root
                {...createForm.register("tags")}
                placeholder="fintech, b2b, saas"
              />
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold">
                Locations (comma-separated)
              </Text>
              <TextField.Root
                {...createForm.register("locations")}
                placeholder="San Francisco, New York, Remote"
              />
            </Box>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleCreate}>Create Company</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Edit Dialog */}
      <Dialog.Root
        open={!!editingCompany}
        onOpenChange={() => setEditingCompany(null)}
      >
        <Dialog.Content style={{ maxWidth: 600 }}>
          <Dialog.Title>Edit Company</Dialog.Title>
          <Dialog.Description>
            Update the company information.
          </Dialog.Description>

          <Flex direction="column" gap="3" className="mt-4">
            <Box>
              <Text as="label" size="2" weight="bold">
                Company Name *
              </Text>
              <TextField.Root
                {...editForm.register("name", {
                  required: "Company name is required",
                })}
                placeholder="Company Name"
              />
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold">
                Website
              </Text>
              <TextField.Root
                {...editForm.register("website")}
                placeholder="https://company.com"
              />
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold">
                Job Board URL *
              </Text>
              <TextField.Root
                {...editForm.register("jobBoardUrl", {
                  required: "Job board URL is required",
                })}
                placeholder="https://company.com/careers"
              />
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold">
                ATS Type
              </Text>
              <Select.Root
                value={editForm.watch("sourceType")}
                onValueChange={(value: "ashby" | "greenhouse" | "other") =>
                  editForm.setValue("sourceType", value)
                }
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="ashby">Ashby</Select.Item>
                  <Select.Item value="greenhouse">Greenhouse</Select.Item>
                  <Select.Item value="other">Other</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold">
                Company Stage
              </Text>
              <Select.Root
                value={editForm.watch("stage")}
                onValueChange={(value) => editForm.setValue("stage", value)}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="">Select Stage</Select.Item>
                  {stageOptions.map((stage) => (
                    <Select.Item key={stage} value={stage}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold">
                Tags (comma-separated)
              </Text>
              <TextField.Root
                {...editForm.register("tags")}
                placeholder="fintech, b2b, saas"
              />
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold">
                Locations (comma-separated)
              </Text>
              <TextField.Root
                {...editForm.register("locations")}
                placeholder="San Francisco, New York, Remote"
              />
            </Box>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={handleUpdate}>Update Company</Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Container>
  );
}
