import '../../scss/license.scss'
import React, { useContext, useEffect, useState } from 'react'
import Linkify from 'react-linkify'
import FontContext from '../../contexts/FontContext'
import FontNameHeader from '../FontNameHeader'

type NameTable = {
  [key: string]: string
}

// https://github.com/opentypejs/opentype.js/blob/88f7c1755ceec3326cdac4de53bc5ec89d38a615/src/tables/name.js#L9
const nameTableNames = [
  'copyright',
  'fontFamily',
  'fontSubfamily',
  'uniqueID',
  'fullName',
  'version',
  'postScriptName',
  'trademark',
  'manufacturer',
  'designer',
  'description',
  'manufacturerURL',
  'designerURL',
  'license',
  'licenseURL',
  'reserved',
  'preferredFamily',
  'preferredSubfamily',
  'compatibleFullName',
  'sampleText',
  'postScriptFindFontName',
  'wwsFamily',
  'wwsSubfamily'
].sort((a, b) => a.localeCompare(b))

const License = (): JSX.Element => {
  const { font } = useContext(FontContext)
  const [namingTable, setNamingTable] = useState<NameTable>({})

  useEffect(() => {
    const table: NameTable = {}
    const headTable = font.tables?.head

    nameTableNames.forEach(name => {
      const tableValue = font.tables?.name[name]?.en

      if (tableValue) {
        table[name] = tableValue
      }
    })

    if (headTable?.created) {
      table.created = new Date(headTable.created * 1_000).toString()
    }

    if (headTable?.modified) {
      table.modified = new Date(headTable.modified * 1_000).toString()
    }

    setNamingTable(table)
  }, [])

  return (
    <div className="license">
      <FontNameHeader />
      <table>
        <colgroup>
          <col style={{ width: '15%' }} />
          <col style={{ width: '85%' }} />
        </colgroup>
        <tbody>
          {Object.entries(namingTable).map(([key, value]) => (
            <tr key={key}>
              <td data-key>{key}</td>
              <td>
                <Linkify>{value}</Linkify>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default License
