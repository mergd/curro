"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { ExternalLinkIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Link,
  Select,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useQuery } from "convex/react";
import { useState } from "react";

type Job = {
  _id: Id<"jobs">;
  _creationTime: number;
  title: string;
  company: {
    _id: Id<"companies">;
    name: string;
    website?: string;
    logoUrl?: string;
    stage?: string;
    tags?: string[];
    locations?: string[];
  } | null;
  description: string;
  url: string;
  locations?: string[];
  source?: string;
  educationLevel?: string;
  yearsOfExperience?: { min: number; max?: number };
  roleType?: string;
  isInternship?: boolean;
  salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
  remoteOptions?: string;
  equity?: { offered: boolean; percentage?: number; details?: string };
  lastScraped?: number;
};

export function JobList() {
  const jobs = useQuery(api.jobs.list);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleType, setSelectedRoleType] = useState("all");
  const [selectedRemoteOption, setSelectedRemoteOption] = useState("all");
  const [selectedCompanyStage, setSelectedCompanyStage] = useState("all");

  const filteredJobs = jobs?.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRoleType =
      selectedRoleType === "all" || job.roleType === selectedRoleType;

    const matchesRemoteOption =
      selectedRemoteOption === "all" ||
      job.remoteOptions === selectedRemoteOption;

    const matchesCompanyStage =
      selectedCompanyStage === "all" ||
      job.company?.stage === selectedCompanyStage;

    return (
      matchesSearch &&
      matchesRoleType &&
      matchesRemoteOption &&
      matchesCompanyStage
    );
  });

  const formatSalary = (salaryRange?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  }) => {
    if (!salaryRange) return null;

    const { min, max, currency = "USD", period = "annual" } = salaryRange;
    const periodText = period === "annual" ? "/year" : "/hour";

    if (min && max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()} ${periodText}`;
    } else if (min) {
      return `${currency} ${min.toLocaleString()}+ ${periodText}`;
    }
    return null;
  };

  const formatExperience = (experience?: { min: number; max?: number }) => {
    if (!experience) return null;

    if (experience.max) {
      return `${experience.min}-${experience.max} years`;
    }
    return `${experience.min}+ years`;
  };

  if (!jobs) {
    return <Text>Loading jobs...</Text>;
  }

  return (
    <Flex direction="column" gap="6">
      {/* Filters */}
      <Card>
        <Flex direction="column" gap="4">
          <Box>
            <Text as="label" size="2" weight="bold" className="mb-2 block">
              Search Jobs
            </Text>
            <TextField.Root>
              <TextField.Slot>
                <MagnifyingGlassIcon height="16" width="16" />
              </TextField.Slot>
              <TextField.Root
                placeholder="Search by job title, company, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </TextField.Root>
          </Box>

          <Grid columns="4" gap="4">
            <Box>
              <Text as="label" size="2" weight="bold" className="mb-2 block">
                Role Type
              </Text>
              <Select.Root
                value={selectedRoleType}
                onValueChange={setSelectedRoleType}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="all">All Roles</Select.Item>
                  <Select.Item value="software-engineering">
                    Software Engineering
                  </Select.Item>
                  <Select.Item value="data-science">Data Science</Select.Item>
                  <Select.Item value="product-management">
                    Product Management
                  </Select.Item>
                  <Select.Item value="design">Design</Select.Item>
                  <Select.Item value="marketing">Marketing</Select.Item>
                  <Select.Item value="sales">Sales</Select.Item>
                  <Select.Item value="operations">Operations</Select.Item>
                  <Select.Item value="finance">Finance</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold" className="mb-2 block">
                Remote Options
              </Text>
              <Select.Root
                value={selectedRemoteOption}
                onValueChange={setSelectedRemoteOption}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="all">All Options</Select.Item>
                  <Select.Item value="remote">Remote</Select.Item>
                  <Select.Item value="hybrid">Hybrid</Select.Item>
                  <Select.Item value="on-site">On-site</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold" className="mb-2 block">
                Company Stage
              </Text>
              <Select.Root
                value={selectedCompanyStage}
                onValueChange={setSelectedCompanyStage}
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="all">All Stages</Select.Item>
                  <Select.Item value="pre-seed">Pre-seed</Select.Item>
                  <Select.Item value="seed">Seed</Select.Item>
                  <Select.Item value="series-a">Series A</Select.Item>
                  <Select.Item value="series-b">Series B</Select.Item>
                  <Select.Item value="series-c">Series C+</Select.Item>
                  <Select.Item value="growth">Growth</Select.Item>
                  <Select.Item value="pre-ipo">Pre-IPO</Select.Item>
                  <Select.Item value="public">Public</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            <Box>
              <Text as="label" size="2" weight="bold" className="mb-2 block">
                Results
              </Text>
              <Text size="3" weight="bold">
                {filteredJobs?.length || 0} jobs found
              </Text>
            </Box>
          </Grid>
        </Flex>
      </Card>

      {/* Job Listings */}
      <Flex direction="column" gap="4">
        {filteredJobs?.map((job) => (
          <Card key={job._id} className="hover:shadow-md transition-shadow">
            <Flex direction="column" gap="3">
              <Flex justify="between" align="start">
                <Flex direction="column" gap="2">
                  <Flex align="center" gap="3">
                    <Heading size="5">
                      <Link href={job.url} target="_blank" color="blue">
                        {job.title}
                        <ExternalLinkIcon
                          className="inline ml-1"
                          width="14"
                          height="14"
                        />
                      </Link>
                    </Heading>
                    {job.isInternship && (
                      <Badge color="purple">Internship</Badge>
                    )}
                  </Flex>

                  <Flex align="center" gap="2">
                    <Text size="4" weight="medium">
                      {job.company?.name}
                    </Text>
                    {job.company?.stage && (
                      <Badge variant="soft" color="blue">
                        {job.company.stage}
                      </Badge>
                    )}
                    {job.company?.website && (
                      <Link
                        href={job.company.website}
                        target="_blank"
                        size="2"
                        color="gray"
                      >
                        <ExternalLinkIcon width="12" height="12" />
                      </Link>
                    )}
                  </Flex>

                  {/* Company Tags */}
                  {job.company?.tags && job.company.tags.length > 0 && (
                    <Flex gap="1" wrap="wrap">
                      {job.company.tags.map((tag, i) => (
                        <Badge key={i} size="1" variant="soft" color="gray">
                          {tag}
                        </Badge>
                      ))}
                    </Flex>
                  )}
                </Flex>

                <Flex direction="column" gap="1" align="end">
                  {job.remoteOptions && (
                    <Badge variant="outline" color="green">
                      {job.remoteOptions}
                    </Badge>
                  )}
                  {job.roleType && (
                    <Badge variant="soft">
                      {job.roleType.replace("-", " ")}
                    </Badge>
                  )}
                </Flex>
              </Flex>

              {/* Job Details */}
              <Flex gap="6" wrap="wrap" align="center">
                {(job.locations || job.company?.locations) && (
                  <Flex align="center" gap="1">
                    <Text size="2" color="gray">
                      📍
                    </Text>
                    <Text size="2">
                      {(job.locations || job.company?.locations)?.join(", ")}
                    </Text>
                  </Flex>
                )}

                {job.yearsOfExperience && (
                  <Flex align="center" gap="1">
                    <Text size="2" color="gray">
                      💼
                    </Text>
                    <Text size="2">
                      {formatExperience(job.yearsOfExperience)}
                    </Text>
                  </Flex>
                )}

                {formatSalary(job.salaryRange) && (
                  <Flex align="center" gap="1">
                    <Text size="2" color="gray">
                      💰
                    </Text>
                    <Text size="2">{formatSalary(job.salaryRange)}</Text>
                  </Flex>
                )}

                {job.equity?.offered && (
                  <Flex align="center" gap="1">
                    <Text size="2" color="gray">
                      📈
                    </Text>
                    <Text size="2">
                      Equity{" "}
                      {job.equity.percentage
                        ? `(${job.equity.percentage}%)`
                        : ""}
                    </Text>
                  </Flex>
                )}

                {job.educationLevel && (
                  <Flex align="center" gap="1">
                    <Text size="2" color="gray">
                      🎓
                    </Text>
                    <Text size="2">{job.educationLevel.replace("-", " ")}</Text>
                  </Flex>
                )}
              </Flex>

              {/* Description */}
              {job.description && (
                <>
                  <Separator />
                  <Text size="2" color="gray" className="line-clamp-3">
                    {job.description.slice(0, 300)}
                    {job.description.length > 300 && "..."}
                  </Text>
                </>
              )}

              <Flex justify="between" align="center">
                <Text size="1" color="gray">
                  Posted {new Date(job._creationTime).toLocaleDateString()}
                </Text>
                <Button asChild size="2">
                  <Link href={job.url} target="_blank">
                    Apply Now
                    <ExternalLinkIcon width="14" height="14" />
                  </Link>
                </Button>
              </Flex>
            </Flex>
          </Card>
        ))}

        {filteredJobs?.length === 0 && (
          <Card>
            <Flex direction="column" align="center" gap="2" className="py-8">
              <Text size="4" color="gray">
                No jobs found
              </Text>
              <Text size="2" color="gray">
                Try adjusting your filters or search terms
              </Text>
            </Flex>
          </Card>
        )}
      </Flex>
    </Flex>
  );
}
