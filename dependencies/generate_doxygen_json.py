#!/usr/bin/python3

from __future__ import annotations
import xml.etree.ElementTree as ET
import glob
import sys
from dataclasses import dataclass, asdict
from typing import List
import json

# Get all XML files in a directory passed in as the first argument
xml_files = glob.glob(sys.argv[1] + '/*.xml')


@dataclass
class File:
  id: str
  name: str
  functions: List[str]
  modules: List[str]
  types: List[str]

@dataclass
class FunctionParameter:
  name: str
  type: str
  description: str | None

@dataclass
class Function:
  id: str
  name: str
  parameters: List[FunctionParameter]
  return_type: str
  brief_description: str | None
  detailed_description: str | None

@dataclass
class Module:
  id: str
  name: str
  functions: List[str]
  types: List[str]

@dataclass
class StructureMember:
  name: str
  type: str

@dataclass
class Structure:
  name: str
  members: List[StructureMember]

functions: List[Function] = []
modules: List[Module] = []
types: List[Structure] = []
files: List[File] = []

def parse_text(node):
  # Collect all subtext ignoring parameterlist and simplesect tags
  if node.tag == 'parameterlist' or node.tag == 'simplesect':
    return ''
  
  text = node.text if node.text is not None else ''
  for child in node:
    text += parse_text(child)
  text += node.tail if node.tail is not None else ''
  return text.strip()

def parse_detaileddescription(node):
  """Return a dictionary of parameter names to their descriptions"""
  parameter_items = node.findall('para/parameterlist/parameteritem/*')
  parameter_descriptions = {}
  for item in parameter_items:
    if item.tag == 'parameternamelist':
      parameter_name = item.find('parametername').text
    elif item.tag == 'parameterdescription':
      parameter_descriptions[parameter_name] = item.text.strip()
  return parameter_descriptions

def parse_function(node):
  global functions

  id = node.get('id')
  name = node.find('name').text
  return_type = node.find('type').text

  parameters = []

  detaileddescription = node.find('detaileddescription')
  detailed_description = None
  parameter_items = {}
  if detaileddescription is not None:
    parameter_items = parse_detaileddescription(detaileddescription)
    detailed_description = parse_text(detaileddescription)

  for param in node.findall('param'):
    declname = param.find('declname')
    type = param.find('type')
    if declname is None or type is None: continue
    parameters.append(FunctionParameter(
      declname.text,
      type.text,
      parameter_items.get(declname.text, None)
    ))

  brief_description = node.find('briefdescription')

  functions.append(Function(
    id,
    name,
    parameters,
    return_type,
    parse_text(brief_description) if brief_description is not None else None,
    detailed_description
  ))


def parse_file(node):
  global files

  id = node.get('id')
  name = node.find('compoundname').text

  sections = node.findall('sectiondef')
  functions = []

  for section in sections:
    if section.get('kind') == 'func':
      for member in section.findall('memberdef'):
        if member.get('kind') == 'function':
          functions.append(member.get('id'))
          parse_function(member)

  files.append(File(id, name, functions, [], []))

def parse_compounddef(node):
  # Determine kind
  kind = node.get('kind')
  if kind == 'file':
    parse_file(node)

def parse_xml(tree):
  root = tree.getroot()
  for child in root:
    if child.tag == 'compounddef':
      parse_compounddef(child)

for xml_file in xml_files:
  tree = ET.parse(xml_file)
  parse_xml(tree)

# Convert lists to dictionaries by ID
files_dict = {file.id: asdict(file) for file in files}
functions_dict = {function.id: asdict(function) for function in functions}
modules_dict = {module.id: asdict(module) for module in modules}
types_dict = {type.name: asdict(type) for type in types}



print(json.dumps({
  'files': files_dict,
  'functions': functions_dict,
  'modules': modules_dict,
  'types': types_dict
}, indent=2))