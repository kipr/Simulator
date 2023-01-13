#!/usr/bin/python3

from __future__ import annotations
import xml.etree.ElementTree as ET
import glob
import sys
from dataclasses import dataclass, asdict
from typing import List
import json
import argparse

parser = argparse.ArgumentParser(
  prog = 'generate_doxygen_json',
  description = 'Generates a JSON file from Doxygen XML output'
)

parser.add_argument(
  'input_dir',
  help = 'Directory containing Doxygen XML output'
)

parser.add_argument(
  'output_file',
  help = 'Output file to write JSON to'
)

args = parser.parse_args()

def eprint(*args, **kwargs):
  print(*args, file=sys.stderr, **kwargs)

# Get all XML files in a directory passed in as the first argument
xml_files = glob.glob(args.input_dir + '/*.xml')


@dataclass
class File:
  id: str
  name: str
  functions: List[str]
  structures: List[str]
  enumerations: List[str]

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
  return_description: str | None
  brief_description: str | None
  detailed_description: str | None

@dataclass
class Module:
  id: str
  name: str
  functions: List[str]
  structures: List[str]
  enumerations: List[str]

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
      parameter_name = parse_text(item.find('parametername'))
    elif item.tag == 'parameterdescription':
      parameter_descriptions[parameter_name] = parse_text(item)
  return parameter_descriptions

def parse_function(node):
  global functions

  id = node.get('id')
  name = node.find('name').text
  return_type = None
  return_type_raw = node.find('type')
  # Extract last reference from return type or use entire text
  if return_type_raw is not None:
    return_type = parse_text(return_type_raw)
    refs_gen = return_type_raw.findall('ref')
    refs = [ref for ref in refs_gen]
    if len(refs) > 0:
      return_type = parse_text(refs[-1])
    
    # Remove EXPORT_SYM from return type
    return_type = return_type.replace('EXPORT_SYM ', '')

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
      parse_text(type),
      parameter_items.get(declname.text, None)
    ))

  # Extract return description from <simplesect kind="return"> in detaileddescription
  return_description = None
  if detaileddescription is not None:
    return_description = detaileddescription.find('simplesect')
    if return_description is not None:
      return_description = parse_text(return_description)
    else:
      return_description = None

  brief_description = node.find('briefdescription')

  functions.append(Function(
    id,
    name,
    parameters,
    return_type,
    return_description,
    parse_text(brief_description) if brief_description is not None else None,
    detailed_description
  ))

def parse_module(node):
  global modules

  function_ids = []

  sections = node.findall('sectiondef')
  for section in sections:
    if section.get('kind') == 'func':
      for member in section.findall('memberdef'):
        if member.get('kind') == 'function':
          function_ids.append(member.get('id'))

  modules.append(Module(
    node.get('id'),
    node.find('compoundname').text,
    function_ids,
    [],
    []
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
  if kind == 'group':
    parse_module(node)

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


with open(args.output_file, 'w') as f:
  f.write(json.dumps({
    'files': files_dict,
    'functions': functions_dict,
    'modules': modules_dict,
    'types': types_dict
  }, indent = 2))