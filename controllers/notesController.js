/*
 * @Author: Joshua Eigbe self@joshuaeigbe.com
 * @Github: https://github.com/jsh007
 * @Date: 2024-01-08 00:16:46
 * @LastEditors: Joshua Eigbe self@joshuaeigbe.com
 * @LastEditTime: 2024-01-18 14:16:44
 * @FilePath: /mern-crud/controllers/notesController.js
 * @copyrightText: Copyright (c) Joshua Eigbe. All Rights Reserved.
 * @Description: See Github repo
 */
const Note = require("../models/Note");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find().lean();
  if (!notes) {
    res.status(400).json({ message: "No Notes found" });
  }
  res.json(notes);
});

/**
 * @description Create a new note
 * @route POST /notes
 * @access private
 */
const createNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const author = await User.findById(user).lean().exec();
  const noteObject = { user, title, text };
  const note = await Note.create(noteObject);

  if (note) {
    res.status(201).json({
      message: `New note ${note.ticket} created for ${author.username} !`,
    });
  } else {
    res.status(404).json({ message: "Invalid note data !" });
  }
});

/**
 * @description Update a note
 * @route PATCH /notes
 * @access private
 */
const updateNote = asyncHandler(async (req, res) => {
  const { id, title, text, completed } = req.body;

  if (!id || !title) {
    return res.status(400).json({ message: "All fields are required !" });
  }

  const note = await Note.findById(id).exec();
  if (!note) {
    return res.status(400).json({ message: "Note not found !" });
  }

  note.title = title;

  if (text) {
    note.text = text;
  }

  if (completed) {
    note.completed = completed;
  }
  const updatedNote = await note.save();
  console.log(updatedNote);
  res.json({
    message: `Note with ID ${updatedNote.ticket} updated successfully!`,
  });
});

/**
 * @description Delete a note
 * @route DELETE /notes
 * @access private
 */
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Note's ID required !" });
  }
  const note = await Note.findById(id).exec();
  if (!note) {
    return res.status(400).json({ message: "Note not found !" });
  }
  //   console.log(note);
  const result = await note.deleteOne();
  res.json({ message: `Note # ${note.ticket} deleted successfully !` });
});

module.exports = { getAllNotes, createNote, updateNote, deleteNote };