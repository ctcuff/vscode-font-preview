import '../scss/tab-view.scss'
import React from 'react'
import { Tabs, TabList, TabPanel, Tab as ReactTab } from 'react-tabs'

type TabProps = {
  // These props is accessed in the TabView component
  // eslint-disable-next-line react/no-unused-prop-types
  title: string
  // eslint-disable-next-line react/no-unused-prop-types
  visible?: boolean
  children: React.ReactNode
}

type TabViewProps = {
  children: typeof Tab[] | React.ReactNode
  className?: string
  panelClassName?: string
}

/**
 * A wrapper component that makes working with the tab view feel a little
 * cleaner. This allows the TabView to also access the props of each
 * of its tabs
 */
const Tab = ({ children }: TabProps): JSX.Element => <>{children}</>

const TabView = ({
  children,
  className = '',
  panelClassName = ''
}: TabViewProps): JSX.Element => {
  const tabs = (children as React.ReactElement<TabProps>[]).filter(
    child => !!child && (child.props.visible ?? true)
  )

  return (
    <Tabs className={`tab-view ${className}`} selectedTabClassName="tab--selected">
      <TabList className="tab-list">
        {tabs.map((tab, index) => (
          <ReactTab className="tab" selectedClassName="tab--selected" key={index}>
            {tab.props.title}
          </ReactTab>
        ))}
      </TabList>

      {tabs.map((tab, index) => (
        <TabPanel
          className={`tab-panel ${panelClassName}`}
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
