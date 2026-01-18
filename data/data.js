// Generated from local JSON sources. Do not edit by hand.
window.CHURCHTREE_DATA = {
  nodes: [
  {
    "id": "pcusa",
    "name": "Presbyterian Church (USA)",
    "kind": "denomination",
    "start_year": 1983,
    "short_label": "PC(USA)",
    "region": "US",
    "distinctives": ["Reformed", "Barthianist", "Mainline Protestant"]
  },
  {
    "id": "pca",
    "name": "Presbyterian Church in America",
    "kind": "denomination",
    "start_year": 1973,
    "short_label": "PCA",
    "region": "US",
    "distinctives": ["Reformed", "Evangelical"]
  },
  {
    "id": "opc",
    "name": "Orthodox Presbyterian Church",
    "kind": "denomination",
    "start_year": 1936,
    "short_label": "OPC",
    "region": "US",
    "distinctives": ["Confessional", "Reformed (Calvinist)"]
  },
  {
    "id": "pcus",
    "name": "Presbyterian Church in the United States",
    "kind": "denomination",
    "start_year": 1861,
    "end_year": 1983,
    "short_label": "PCUS",
    "region": "US",
    "notes": "Merged into PC(USA) in 1983.",
    "distinctives": ["Old School Presbyterian emphasis", "Westminster Confession subscription"]
  },
  {
    "id": "pcusa-1789",
    "name": "Presbyterian Church in the United States of America",
    "kind": "denomination",
    "start_year": 1789,
    "end_year": 1958,
    "short_label": "PCUSA",
    "region": "US",
    "notes": "Merged into UPCUSA in 1958.",
    "distinctives": ["Mainline Protestant", "Reformed tradition"]
  },
  {
    "id": "upcusa",
    "name": "United Presbyterian Church in the United States of America",
    "kind": "denomination",
    "start_year": 1958,
    "end_year": 1983,
    "short_label": "UPCUSA",
    "region": "US",
    "notes": "Merged into PC(USA) in 1983.",
    "distinctives": ["Reformed (Calvinist)"]
  },
  {
    "id": "upcna",
    "name": "United Presbyterian Church of North America",
    "kind": "denomination",
    "start_year": 1858,
    "end_year": 1958,
    "short_label": "UPCNA",
    "region": "US",
    "notes": "Merger partner in 1958 formation of UPCUSA.",
    "distinctives": ["Calvinist", "Covenanter/Seceder distinctives", "Exclusive psalmody"]
  }
]
,
  edges: [
  {
    "id": "pcusa-1789-to-pcus-1861",
    "name": "Southern branch over slavery/politics",
    "from_id": "pcusa-1789",
    "to_id": "pcus",
    "type": "split",
    "year": 1861,
    "reasons": ["slavery", "politics", "theology", "Civil War tensions"],
    "description": "Southern Presbyterians formed the PCUS as the Southern branch, separating from the PCUSA during Civil War-era disputes over slavery, politics, and theology.",
    "citations": ["cite-pcus-1861", "cite-pcus-1861-reasons", "cite-pcus-founded"]
  },
  {
    "id": "pcusa-1789-to-opc-1936",
    "name": "Modernist theology disputes",
    "from_id": "pcusa-1789",
    "to_id": "opc",
    "type": "split",
    "year": 1936,
    "reasons": ["liberal/modernist theology", "fundamentalist-modernist controversy"],
    "description": "Conservative/confessional Presbyterians separated to form the OPC in response to perceived liberal/modernist trends in the PCUSA.",
    "citations": ["cite-opc-1936", "cite-opc-1936-reasons", "cite-opc-founded"]
  },
  {
    "id": "pcus-to-pca-1973",
    "name": "Scripture authority, liberalism",
    "from_id": "pcus",
    "to_id": "pca",
    "type": "split",
    "year": 1973,
    "reasons": ["theological liberalism", "authority of Scripture", "deity of Jesus Christ"],
    "description": "Conservative/confessional congregations separated from the PCUS to form the PCA, citing perceived theological liberalism, including disputes about Scripture's authority and Christ's deity.",
    "citations": ["cite-pca-1973", "cite-pca-1973-reasons", "cite-pcus-1973-reasons-detail", "cite-pca-founded"]
  },
  {
    "id": "pcusa-1789-to-upcusa-1958",
    "name": "Ecumenical reunion",
    "from_id": "pcusa-1789",
    "to_id": "upcusa",
    "type": "merge",
    "year": 1958,
    "reasons": ["ecumenical activity", "reunion of long-separated branches"],
    "description": "The northern PCUSA merged with the smaller UPCNA to form the UPCUSA through ecumenical reunion.",
    "citations": ["cite-upcusa-1958", "cite-upcusa-1958-reasons", "cite-upcusa-founded"]
  },
  {
    "id": "upcna-to-upcusa-1958",
    "name": "Ecumenical reunion",
    "from_id": "upcna",
    "to_id": "upcusa",
    "type": "merge",
    "year": 1958,
    "reasons": ["ecumenical activity", "reunion of long-separated branches"],
    "description": "The smaller UPCNA merged with the larger PCUSA to form the UPCUSA through ecumenical reunion.",
    "citations": ["cite-upcusa-1958", "cite-upcusa-1958-reasons", "cite-upcusa-founded", "cite-upcna-1958-merge"]
  },
  {
    "id": "pcus-to-pcusa-1983",
    "name": "Northern-Southern reunion",
    "from_id": "pcus",
    "to_id": "pcusa",
    "type": "merge",
    "year": 1983,
    "reasons": ["reunion of northern and southern Presbyterian branches"],
    "description": "The Southern branch (PCUS) merged with the northern branch (UPCUSA) to form the PC(USA).",
    "citations": ["cite-pcusa-1983", "cite-pcusa-1983-reasons", "cite-pcusa-merge-1983", "cite-pcusa-founded"]
  },
  {
    "id": "upcusa-to-pcusa-1983",
    "name": "Northern-Southern reunion",
    "from_id": "upcusa",
    "to_id": "pcusa",
    "type": "merge",
    "year": 1983,
    "reasons": ["reunion of northern and southern Presbyterian branches"],
    "description": "The northern branch (UPCUSA) merged with the Southern branch (PCUS) to form the PC(USA).",
    "citations": ["cite-pcusa-1983", "cite-pcusa-1983-reasons", "cite-pcusa-merge-1983", "cite-pcusa-founded"]
  }
]

};
