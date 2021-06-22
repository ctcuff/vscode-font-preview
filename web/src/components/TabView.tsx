import '../scss/tab-view.scss'
import React from 'react'
import { Tabs, TabList, TabPanel, Tab as ReactTab } from 'react-tabs'

type TabProps = {
  // This prop is accessed in the TabView component
  // eslint-disable-next-line react/no-unused-prop-types
  title: string
  children: React.ReactNode
}

type TabViewProps = {
  children: typeof Tab[] | React.ReactNode
}

/**
 * A wrapper component that makes working with the tab view feel a little
 * cleaner. This allows the TabView to also access the props of each
 * of its tabs
 */
const Tab = ({ children }: TabProps): JSX.Element => <>{children}</>

const TabView = ({ children }: TabViewProps): JSX.Element => {
  const tabs = children as React.ReactElement<TabProps>[]

  return (
    <Tabs className="tab-view" selectedTabClassName="tab--selected" defaultIndex={2}>
      <TabList className="tab-list">
        {tabs.map((tab, index) => (
          <ReactTab className="tab" selectedClassName="tab--selected" key={index}>
            {tab.props.title}
          </ReactTab>
        ))}
      </TabList>

      {tabs.map((tab, index) => (
        <TabPanel
          className="tab-panel"
          selectedClassName="tab-panel--selected"
          key={index}
        >
          {tab.props.children}
        </TabPanel>
      ))}
    </Tabs>
  )
}

export { TabView as default, Tab }
