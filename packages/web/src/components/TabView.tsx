import '../scss/tab-view.scss'
import React from 'react'
import { Tabs, TabList, TabPanel, Tab as ReactTab } from 'react-tabs'
import { WorkspaceConfig } from '@font-preview/shared/src/types'

// These props are accessed in the TabView component
type TabProps = {
  title: string // eslint-disable-line react/no-unused-prop-types
  visible?: boolean // eslint-disable-line react/no-unused-prop-types
  id: string // eslint-disable-line react/no-unused-prop-types
  children: React.ReactNode
  forceRender?: boolean // eslint-disable-line react/no-unused-prop-types
}

type TabViewProps = {
  children: React.ReactElement<TabProps>[]
  className?: string
  panelClassName?: string
  defaultTabId: WorkspaceConfig['defaultTab'] | null
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
  defaultTabId = null,
  panelClassName = ''
}: TabViewProps): JSX.Element | null => {
  if (defaultTabId === null) {
    return null
  }

  const tabs = children.filter(tab => !!tab && (tab.props.visible ?? true))
  const tabIndex = tabs.findIndex(tab => tab.props.id === defaultTabId)

  return (
    <Tabs
      className={`tab-view ${className}`}
      selectedTabClassName="tab--selected"
      defaultIndex={Math.max(tabIndex, 0)}
    >
      <TabList className="tab-list">
        {tabs.map((tab, index) => (
          <ReactTab className="tab" selectedClassName="tab--selected" key={index}>
            {tab.props.title}
          </ReactTab>
        ))}
      </TabList>

      {tabs.map((tab, index) => (
        <TabPanel
          forceRender={tab.props.forceRender}
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
