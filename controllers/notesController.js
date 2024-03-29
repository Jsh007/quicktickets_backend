/*
 * @Author: Joshua Eigbe self@joshuaeigbe.com
 * @Github: https://github.com/jsh007
 * @Date: 2024-01-08 00:16:46
 * @LastEditors: Joshua Eigbe jeigbe@gmail.com
 * @LastEditTime: 2024-01-28 15:07:15
 * @FilePath: /quicktickets_backend/controllers/notesController.js
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

  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );

  res.json(notesWithUser);
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
  // const author = await User.findById(user).lean().exec();

  // Check for duplicates
  const duplicate = await Note.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate note title !" });
  }

  // Create New Note
  const noteObject = { user, title, text };
  const note = await Note.create(noteObject);
  if (note) {
    res.status(201).json({
      // message: `New note #${note.ticket} created for ${note.username} !`,
      message: `New note #${note.ticket} created !`,
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
  const { id, user, title, text, completed } = req.body;

  if (!id || !title) {
    return res.status(400).json({ message: "All fields are required !" });
  }

  const note = await Note.findById(id).exec();
  if (!note) {
    return res.status(400).json({ message: "Note not found !" });
  }

  // Check for duplicate note  titles
  const duplicate = await Note.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Note title !" });
  }

  note.title = title;
  note.user = user;

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
