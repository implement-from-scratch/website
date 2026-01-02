'use client';

import { Tab } from '@headlessui/react';
import RoadmapTree from './RoadmapTree';
import { RoadmapTreeNode } from '@/lib/github';
import { ReactNode } from 'react';

interface GuideTabsProps {
  descriptionContent: ReactNode;
  roadmapTree: RoadmapTreeNode;
  repoName: string;
}

export default function GuideTabs({ descriptionContent, roadmapTree, repoName }: GuideTabsProps) {
  return (
    <Tab.Group>
      <Tab.List className="flex space-x-1 rounded-xl bg-gray-900 p-1 mb-8">
        <Tab className={({ selected }) =>
          `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors ${
            selected
              ? 'bg-gray-700 text-white shadow'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`
        }>
          Description
        </Tab>
        <Tab className={({ selected }) =>
          `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors ${
            selected
              ? 'bg-gray-700 text-white shadow'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`
        }>
          Roadmap
        </Tab>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel>
          {descriptionContent || <p className="text-gray-400">No description available.</p>}
        </Tab.Panel>
        <Tab.Panel>
          <RoadmapTree tree={roadmapTree} repoName={repoName} />
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
}
